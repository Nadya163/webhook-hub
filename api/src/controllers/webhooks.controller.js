import { v4 as uuidv4 } from "uuid";
import { getEvents, getSources, saveEvents } from "../services/storage.js";
import { deliverEvent } from "../services/delivery.js";

export async function ingestWebhook(req, res) {
  try {
    const { sourceId } = req.params;

    const sources = await getSources();
    const source = sources.find((source) => source.id === sourceId);

    if (!source) {
      return res.status(404).json({ error: "Источник не найден" });
    }

    if (source.secret) {
      const incomingSecret = req.headers["x-webhook-secret"];
      if (incomingSecret !== source.secret) {
        return res.status(401).json({
          error: "Неверный секрет",
          code: "UNAUTHORIZED",
        });
      }
    }
    const eventId = uuidv4();
    const event = {
      id: eventId,
      sourceId,
      headers: {
        "content-type": req.headers["content-type"] || null,
        "user-agent": req.headers["user-agent"] || null,
        "x-webhook-secret": req.headers["x-webhook-secret"] ? "***" : null,
      },
      body: req.body,
      receivedAt: new Date().toISOString(),
      delivery: {
        status: "pending",
        attempts: [],
        lastError: null,
      },
    };

    const events = await getEvents();
    events.push(event);
    await saveEvents(events);

    res.status(202).json({ eventId, status: "received" });

    deliverEvent(event, source);
  } catch (error) {
    console.log("Ошибка", error.message);
    res.status(500).json({ error: "Ошибка сервера" });
  }
}
