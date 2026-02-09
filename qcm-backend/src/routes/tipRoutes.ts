import express from "express";
import Tip from "../models/Tip";
import { authenticateStudent } from "../middleware/authMiddleware";
import { verifyAdmin } from "../middleware/verifyAdmin";

const router = express.Router();

// ➕ Créer une astuce (ADMIN)
router.post("/", authenticateStudent, verifyAdmin, async (req, res) => {
  try {
    const { subject, chapter, content } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const tip = await Tip.create({ subject, chapter, content });
    res.status(201).json(tip);
  } catch (err) {
    console.error("Erreur création astuce :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 📚 Astuces par matière (étudiant & admin)
router.get("/by-subject/:subject", async (req, res) => {
  try {
    const tips = await Tip.find({ subject: req.params.subject }).sort({ createdAt: -1 });
    res.json(tips);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
