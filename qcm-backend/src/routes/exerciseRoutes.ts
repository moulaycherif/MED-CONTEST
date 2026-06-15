// routes/exerciseRoutes.ts
import express, { Request, Response } from "express";
import Exercise from "../models/Exercise";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { authenticateAdmin } from "../middleware/authAdmin";

import multer from "multer";
import path from "path";
import fs from "fs";
import xlsx from "xlsx"; // 👈 Ajout du parser Excel

const router = express.Router();

// Configuration Multer standard pour les images
const uploadDir = path.join(process.cwd(), "uploads", "exercises");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });
// Configuration Multer pour l'import en mémoire temporaire
const excelUpload = multer({ storage: multer.memoryStorage() });

// ======================================================
// 📋 Récupérer tous les exercices
// ======================================================
router.get("/", async (req: Request, res: Response) => {
  try {
    const exercises = await Exercise.find();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ======================================================
// 🖼 Upload d'image depuis l'éditeur riche (Quill)
// ======================================================
router.post("/upload-editor-image", authenticateAdmin, verifyAdmin, upload.single("image"), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ error: "Aucun fichier uploadé" });
    return;
  }
  res.json({ url: `/uploads/exercises/${req.file.filename}` });
});

// ======================================================
// ➕ Ajouter un exercice manuel
// ======================================================
router.post("/", authenticateAdmin, verifyAdmin, upload.single("contextImage"), async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, chapter, contextText, subQuestions } = req.body;
    let parsedSubQuestions = subQuestions;

    if (typeof subQuestions === "string") {
      try {
        parsedSubQuestions = JSON.parse(subQuestions);
      } catch (e) {
        res.status(400).json({ error: "Format des sous-questions invalide" });
        return;
      }
    }

    parsedSubQuestions = parsedSubQuestions.filter((q: any) => q.questionText && q.questionText.trim() !== "");
    if (parsedSubQuestions.length === 0) {
      res.status(400).json({ error: "Au moins une sous-question est requise" });
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
    res.status(500).json({ error: "Erreur serveur lors de la création" });
  }
});

// ======================================================
// 📥 NOUVEAU : Importation fichier Excel (.xlsx / .xls)
// ======================================================
router.post("/import-excel", authenticateAdmin, verifyAdmin, excelUpload.single("excelFile"), async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, chapter } = req.body;
    if (!req.file) {
      res.status(400).json({ error: "Veuillez fournir un fichier Excel." });
      return;
    }
    if (!subject || !chapter) {
      res.status(400).json({ error: "La matière et le chapitre sont obligatoires pour l'import." });
      return;
    }

    // Extraction des données de la feuille Excel
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData: any[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (sheetData.length === 0) {
      res.status(400).json({ error: "Le fichier Excel est vide." });
      return;
    }

    // Parcours des lignes Excel et création unitaire des structures contextes/questions
    let importedCount = 0;
    for (const row of sheetData) {
      const enonce = row.Enonce || row.Question; // Fallback s'il n'y a pas d'énoncé global séparé
      const typeQuestion = row.Type?.toLowerCase() === "vrai_faux" ? "vrai_faux" : "qcm";
      
      let optionsArray: string[] = [];
      if (typeQuestion === "vrai_faux") {
        optionsArray = ["Vrai", "Faux"];
      } else {
        optionsArray = [row.OptionA, row.OptionB, row.OptionC, row.OptionD].filter(o => o !== undefined && String(o).trim() !== "");
      }

      await Exercise.create({
        subject,
        chapter,
        contextText: enonce,
        contextImage: "",
        subQuestions: [{
          questionText: row.Question,
          qType: typeQuestion,
          options: optionsArray,
          correctAnswer: String(row.BonneReponse).trim(),
          explanation: row.Explication || ""
        }]
      });
      importedCount++;
    }

    res.status(200).json({ success: true, message: `Importation réussie de ${importedCount} exercices.` });
  } catch (error) {
    console.error("Erreur import Excel :", error);
    res.status(500).json({ error: "Erreur lors du traitement du fichier Excel." });
  }
});

// Les routes de filtres et suppressions restent inchangées...
router.get("/by-subject/:subject", async (req: Request, res: Response) => {
  try {
    const exercises = await Exercise.find({ subject: req.params.subject });
    res.json(exercises);
  } catch (error) { res.status(500).json({ error: "Erreur" }); }
});

router.get("/:subject/:chapter", async (req: Request, res: Response) => {
  try {
    const exercises = await Exercise.find({ subject: req.params.subject, chapter: req.params.chapter });
    res.json(exercises);
  } catch (error) { res.status(500).json({ error: "Erreur" }); }
});

router.delete("/:id", authenticateAdmin, verifyAdmin, async (req: Request, res: Response) => {
  try {
    await Exercise.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: "Erreur" }); }
});

export default router;