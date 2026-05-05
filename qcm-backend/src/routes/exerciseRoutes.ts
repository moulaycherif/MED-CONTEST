import express from "express";
import Exercise from "../models/Exercise";
import { verifyAdmin } from "../middleware/verifyAdmin";

import { authenticateAdmin } from "../middleware/authAdmin";

const router = express.Router();

// ➕ Ajouter UNE question
router.post("/", authenticateAdmin, verifyAdmin, async (req, res) => {
  const { subject, chapter, question, options, correctAnswer } = req.body;

  const exercise = await Exercise.create({
    subject,
    chapter,
    question,
    options,
    correctAnswer,
  });

  res.status(201).json(exercise);
});

// 📚 Lister par matière
router.get("/by-subject/:subject", async (req, res) => {
  const exercises = await Exercise.find({ subject: req.params.subject });
  res.json(exercises);
});

// 📖 par matière + chapitre
router.get("/", async (req, res) => {
  const { subject, chapter } = req.query;

  const exercises = await Exercise.find({
    subject,
    chapter,
  });

  res.json(exercises);
});

// ❌ Supprimer
router.delete("/:id", verifyAdmin, async (req, res) => {
  await Exercise.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
