import { Router } from "express";
import { generate } from "../controllers/resumeController";

const router = Router();

router.post("/generate", generate);

export default router;
