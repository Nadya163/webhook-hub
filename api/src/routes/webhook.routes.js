import { Router } from "express";
import { ingestWebhook } from "../controllers/webhooks.controller.js";

const router = Router();

router.post("/:sourceId", ingestWebhook);

export default router;
