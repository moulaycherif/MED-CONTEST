import { Router } from "express";
import { getAstucesByChapitre } from "../controllers/astuces.controller";

const router = Router();

router.get("/:chapitre", getAstucesByChapitre);

export default router;
