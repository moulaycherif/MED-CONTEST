import { Router } from "express";
import { getAstucesByChapter } from "../controllers/astucesController";
import Astuce from "../models/Astuce";

const router = Router();

router.get("/:chapitre", getAstucesByChapter);

/* 🔵 LISTE DE TOUTES LES ASTUCES (ADMIN) */
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

export default router;
