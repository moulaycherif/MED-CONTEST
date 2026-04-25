import { Router } from "express";
import {
  getAstucesByChapter,
  createAstuce,
  uploadAstucePdf
} from "../controllers/astucesController";
import Astuce from "../models/Astuce";

import multer from "multer";

const upload = multer();

const router = Router();

console.log("✅ astuceRoutes chargé");

console.log("astuceRoutes :",uploadAstucePdf);

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

router.post(
  "/upload-pdf",
  upload.single("file"), // 🔥 IMPORTANT
  (req, res, next) => {
    console.log("📥 Route upload PDF appelée");
    next();
  },
  uploadAstucePdf
);

// 🔥 IMPORTANT : AVANT /:chapter
router.get("/detail/:id", async (req, res) => {
  console.log("🔥 ROUTE DETAIL APPELÉE");
  res.send("OK");
  try {
    const astuce = await Astuce.findById(req.params.id);

    if (!astuce) {
      return res.status(404).json({ message: "Astuce introuvable" });
    }

    res.json(astuce);
  } catch (err) {
    console.error("Erreur get astuce by id:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* 🟡 ÉTUDIANT — ASTUCES PAR CHAPITRE */
router.get("/:chapter", getAstucesByChapter);

export default router;
