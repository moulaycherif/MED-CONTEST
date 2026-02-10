import express from "express";
import Exercise from "../models/Exercise";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { authenticateStudent } from "../middleware/authMiddleware";

const router = express.Router();

// ➕ Créer un quiz
router.post("/", authenticateStudent, verifyAdmin, async (req, res) => {
  const { subject, chapter, questions } = req.body;

  const exercise = await Exercise.create({ subject, chapter, questions });
  res.status(201).json(exercise);
});

// 📚 Lister par matière
router.get("/by-subject/:subject", async (req, res) => {
  const exercises = await Exercise.find({ subject: req.params.subject });
  res.json(exercises);
});

// 📖 Lister par matière + chapitre
router.get("/:subject/:chapter", async (req, res) => {
  const exercise = await Exercise.findOne(req.params);
  res.json(exercise);
});

// ❌ Supprimer
router.delete("/:id", authenticateStudent, verifyAdmin, async (req, res) => {
  await Exercise.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
