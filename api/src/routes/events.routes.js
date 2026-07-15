import { Router } from "express";
import {
  listEvents,
  getEvent,
  retryEvent,
} from "../controllers/events.controller.js";

const router = Router();

router.get("/", listEvents);
router.get("/:id", getEvent);
router.post("/:id/retry", retryEvent);

export default router;
