import { deliverEvent } from "../services/delivery.js";
import { getEvents, getSources, saveEvents } from "../services/storage.js";

export async function listEvents(req, res) {
  try {
    const { sourceId, status, page = 1, limit = 20 } = req.query;

    let events = await getEvents();

    if (sourceId) {
      events = events.filter((event) => event.sourceId === sourceId);
    }

    if (status) {
      events = events.filter((event) => {
        if (status === "received") return event.delivery.status === "pending";
        return event.delivery.status === status;
      });
    }

    const total = events.length;
    const start = (page - 1) * limit;
    const items = events.slice(start, start + Number(limit));

    return res.json({ items, page: Number(page), limit: Number(limit), total });
  } catch (error) {
    console.error("Ошибка", error.message);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
}

export async function getEvent(req, res) {
  try {
    const { id } = req.params;
    const events = await getEvents();
    const event = events.find((event) => event.id === id);

    if (!event) {
      return res.status(404).json({ error: "Событие не найдено" });
    }
    return res.json(event);
  } catch (error) {
    console.error("Ошибка", error.message);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
}

export async function retryEvent(req, res) {
  try {
    const { id } = req.params;
    const events = await getEvents();
    const index = events.findIndex((event) => event.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Событие не найдено" });
    }

    events[index].delivery.status = "pending";
    events[index].delivery.attempts = [];
    events[index].delivery.lastError = null;
    await saveEvents(events);

    const sources = await getSources();
    const source = sources.find((source) => source.id === events[index].sourceId);

    res.status(202).json({ status: "retrying" });
    deliverEvent(events[index], source);
  } catch (error) {
    console.error("Ошибка:", error.message);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
}
