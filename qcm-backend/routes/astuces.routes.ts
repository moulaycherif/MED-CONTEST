import { Router } from "express";
import { getAstucesByChapitre } from "../controllers/astucescontroller";

const router = Router();

router.get("/:chapitre", getAstucesByChapitre);

export default router;
