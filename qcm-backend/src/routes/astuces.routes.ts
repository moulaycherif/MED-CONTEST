import { Router } from "express";
import { getAstucesByChapter } from "../controllers/astuces.controller";

const router = Router();

router.get("/:chapitre", getAstucesByChapter);

export default router;
