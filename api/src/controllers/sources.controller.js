import { v4 as uuidv4 } from "uuid";
import { getSources, saveSources } from "../services/storage.js";

export async function createSource(req, res) {
  try {
    const { name, secret, subscriberUrl } = req.body;

    if (!name || name.length < 1 || name.length > 64) {
      return res.status(400).json({
        error: "name обязательно и должно быть от 1 до 64 символов",
      });
    }

    const sources = await getSources();

    const id = uuidv4();
    const newSource = {
      id,
      name,
      secret: secret || null,
      subscriberUrl: subscriberUrl || null,
      createdAt: new Date().toISOString(),
    };

    sources.push(newSource);
    await saveSources(sources);

    return res.status(201).json({
      id: newSource.id,
      name: newSource.name,
      ingestUrl: `http://localhost:4002/webhooks/${id}`,
      hasSecret: !!secret,
    });
  } catch (error) {
    console.error("Ошибка:", error.message);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
}
