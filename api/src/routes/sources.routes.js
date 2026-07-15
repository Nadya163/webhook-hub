import { Router } from "express";
import { createSource } from "../controllers/sources.controller.js";

const router = Router();

router.post("/", createSource);

export default router;
