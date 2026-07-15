import express from "express";
import cors from "cors";
import sourcesRouter from "./routes/sources.routes.js";
import webhookRouter from "./routes/webhook.routes.js";
import eventsRouter from "./routes/events.routes.js";

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

app.use("/api/sources", sourcesRouter);
app.use("/webhooks", webhookRouter);
app.use("/api/events", eventsRouter);

app.get("/ready", (req, res) => {
  res.json({ status: "ready" });
});
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`API сервер запущен на порту ${PORT}`);
});
