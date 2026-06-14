import express from "express";
import Tip from "../models/Tip";
import { authenticateStudent } from "../middleware/authMiddleware";
import { verifyAdmin } from "../middleware/verifyAdmin";

const router = express.Router();

// ➕ Créer une astuce (ADMIN)
router.post("/", authenticateStudent, verifyAdmin, async (req, res) => {
  const tip = await Tip.create(req.body);
  res.status(201).json(tip);
});

// 📚 Astuces par matière
router.get("/by-subject/:subject", async (req, res) => {
  res.json(await Tip.find({ subject: req.params.subject }));
});

// 🔍 Détail d’une astuce
router.get("/:id", async (req, res) => {
  res.json(await Tip.findById(req.params.id));
});

export default router;
