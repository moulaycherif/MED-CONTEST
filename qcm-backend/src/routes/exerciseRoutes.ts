// routes/exerciseRoutes.ts
import express, { Request, Response } from "express";
import Exercise from "../models/Exercise";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { authenticateAdmin } from "../middleware/authAdmin";

import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ======================================================
// 📂 Configuration de Multer (Stockage des images)
// ======================================================
const uploadDir = path.join(process.cwd(), "uploads", "exercises");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ======================================================
// 📋 Récupérer tous les exercices
// ======================================================
router.get("/", async (req: Request, res: Response) => {
  try {
    const exercises = await Exercise.find();
    res.json(exercises);
  } catch (error) {
    console.error("Erreur récupération de tous les exercices :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ======================================================
// 🖼 Upload d'image depuis l'éditeur riche (Quill)
// ======================================================
router.post(
  "/upload-editor-image",
  authenticateAdmin,
  verifyAdmin,
  upload.single("image"),
  (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).json({ error: "Aucun fichier uploadé" });
      return;
    }

    res.json({
      url: `/uploads/exercises/${req.file.filename}`,
    });
  }
);

// ======================================================
// ➕ Ajouter un exercice (Avec sous-questions)
// ======================================================
router.post(
  "/",
  authenticateAdmin,
  verifyAdmin,
  upload.single("contextImage"), // 👈 Le nom a changé dans le frontend
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { subject, chapter, contextText, subQuestions } = req.body;

      // Traitement des sous-questions (envoyées en string JSON via FormData)
     let parsedSubQuestions = subQuestions;

if (typeof subQuestions === "string") {
  try {
    parsedSubQuestions = JSON.parse(subQuestions);
  } catch (e) {
    res.status(400).json({
      error: "Format des sous-questions invalide",
    });
    return;
  }
}

// ✅ Supprimer les sous-questions vides
parsedSubQuestions = parsedSubQuestions.filter(
  (q: any) =>
    q.questionText &&
    q.questionText.trim() !== ""
);

// ✅ Vérifier qu'il reste au moins une question
if (parsedSubQuestions.length === 0) {
  res.status(400).json({
    error: "Au moins une sous-question est requise",
  });
  return;
}

      const exercise = await Exercise.create({
        subject,
        chapter,
        contextText,
        contextImage: req.file ? `/uploads/exercises/${req.file.filename}` : "",
        subQuestions: parsedSubQuestions,
      });

      res.status(201).json(exercise);
    } catch (error) {
      console.error("Erreur création exercice :", error);
      res.status(500).json({ error: "Erreur serveur lors de la création" });
    }
  }
);

// ======================================================
// 📚 Lister par matière (ex: /api/exercises/by-subject/Mathématique)
// ======================================================
router.get("/by-subject/:subject", async (req: Request, res: Response) => {
  try {
    const exercises = await Exercise.find({
      subject: req.params.subject,
    });

    res.json(exercises);
  } catch (error) {
    console.error("Erreur récupération par matière :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ======================================================
// 📘 Lister par matière + chapitre (ex: /api/exercises/Mathématique/Chapitre I)
// ======================================================
router.get("/:subject/:chapter", async (req: Request, res: Response) => {
  try {
    const { subject, chapter } = req.params;

    const exercises = await Exercise.find({
      subject,
      chapter,
    });

    res.json(exercises);
  } catch (error) {
    console.error("Erreur récupération par matière et chapitre :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ======================================================
// ❌ Supprimer un exercice
// ======================================================
router.delete("/:id", authenticateAdmin, verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const exerciseId = req.params.id;

    // 1. Trouver l'exercice pour récupérer le chemin de l'image
    const exercise = await Exercise.findById(exerciseId);
    
    if (!exercise) {
      res.status(404).json({ error: "Exercice non trouvé" });
      return;
    }

    // 2. Si une image de contexte existe, la supprimer physiquement du serveur
    if (exercise.contextImage) {
      const imagePath = path.join(process.cwd(), exercise.contextImage);
      
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (err) {
          console.error("Impossible de supprimer l'image associée :", err);
        }
      }
    }

    // 3. Supprimer le document de la base de données
    await Exercise.findByIdAndDelete(exerciseId);

    res.json({ success: true, message: "Exercice supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression exercice :", error);
    res.status(500).json({ error: "Erreur serveur lors de la suppression" });
  }
});

export default router;