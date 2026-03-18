import { Router } from "express";
import {
  getAstucesByChapter,
  createAstuce,
} from "../controllers/astucesController";
import Astuce from "../models/Astuce";

const router = Router();

/* 🔵 ADMIN — LISTE TOUTES LES ASTUCES */
router.get("/", async (req, res) => {
  try {
    const astuces = await Astuce.find().sort({
      subject: 1,
      chapter: 1,
      order: 1,
    });
    res.json(astuces);
  } catch (err) {
    res.status(500).json({ message: "Erreur chargement astuces" });
  }
});

/* 🟢 ADMIN — CRÉER UNE ASTUCE */
router.post("/", createAstuce);

/* 🟡 ÉTUDIANT — ASTUCES PAR CHAPITRE */
router.get("/:chapter", getAstucesByChapter);

export default router;
