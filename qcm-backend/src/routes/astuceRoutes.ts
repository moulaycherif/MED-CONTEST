import { Router } from "express";
import { getAstucesByChapter } from "../controllers/astucesController";

const router = Router();

router.get("/:chapitre", getAstucesByChapter);

export default router;
