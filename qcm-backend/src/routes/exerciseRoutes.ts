import express from "express";
import Exercise from "../models/Exercise";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { authenticateAdmin } from "../middleware/authAdmin";

import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const uploadDir = path.join(
  process.cwd(),
  "uploads",
  "exercises"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// ======================================================
// ➕ Ajouter un exercice
// ======================================================
router.post("/", authenticateAdmin, verifyAdmin,  upload.single("questionImage"), async (req, res) => {
  try {
    const { subject, chapter, question, options, correctAnswer, explanation } =
      req.body;
console.log("BODY =", req.body);
console.log("FILE =", req.file);
    const exercise = await Exercise.create({
  subject,
  chapter,
  question,

  questionImage: req.file
    ? `/uploads/exercises/${req.file.filename}`
    : "",

  options:
    typeof options === "string"
      ? JSON.parse(options)
      : options,

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