import express from "express";
import Exercise from "../models/Exercise";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { authenticateAdmin } from "../middleware/authAdmin";

const router = express.Router();


// ======================================================
// ➕ Ajouter un exercice
// ======================================================
router.post("/", authenticateAdmin, verifyAdmin, async (req, res) => {
  try {
    const { subject, chapter, question, options, correctAnswer, explanation } =
      req.body;

    const exercise = await Exercise.create({
      subject,
      chapter,
      question,
      options,
      correctAnswer,
      explanation,
    });

    res.status(201).json(exercise);
  } catch (error) {
    console.error("Erreur création exercice :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// ======================================================
// 📚 Lister par matière
// /api/exercises/by-subject/Mathématique
// ======================================================
router.get("/by-subject/:subject", async (req, res) => {
  try {
    const exercises = await Exercise.find({
      subject: req.params.subject,
    });

    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// ======================================================
// 📘 Lister par matière + chapitre
// /api/exercises/Mathématique/Chapitre I
// ======================================================
router.get("/:subject/:chapter", async (req, res) => {
  try {
    const { subject, chapter } = req.params;

    const exercises = await Exercise.find({
      subject,
      chapter,
    });

    res.json(exercises);
  } catch (error) {
    console.error("Erreur récupération exercices :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// ======================================================
// ❌ Supprimer
// ======================================================
router.delete("/:id", authenticateAdmin, verifyAdmin, async (req, res) => {
  try {
    await Exercise.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur suppression" });
  }
});

export default router;