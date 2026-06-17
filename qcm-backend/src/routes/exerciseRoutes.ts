// routes/exerciseRoutes.ts
import express, { Request, Response } from "express";
import Exercise from "../models/Exercise";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { authenticateAdmin } from "../middleware/authAdmin";

import multer from "multer";
import path from "path";
import fs from "fs";
import xlsx from "xlsx";

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
// 📥 Importation fichier Excel (.xlsx / .xls) - MODIFIÉ POUR EXAMEN BLANC
// ======================================================
router.post("/import-excel", authenticateAdmin, verifyAdmin, excelUpload.single("excelFile"), async (req: Request, res: Response): Promise<void> => {
  try {
    // 🚨 On récupère "isWhiteExam" provenant du corps de la requête
    const { subject, chapter, isWhiteExam } = req.body; 
    
    if (!req.file) {
      res.status(400).json({ error: "Veuillez fournir un fichier Excel." });
      return;
    }
    if (!subject || !chapter) {
      res.status(400).json({ error: "La matière et le chapitre sont obligatoires." });
      return;
    }

    // Conversion en booléen sécurisée (car req.body envoie souvent des chaînes de caractères "true"/"false")
   // const checkWhiteExam = isWhiteExam === true || isWhiteExam === "true";//

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData: any[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (sheetData.length === 0) {
      res.status(400).json({ error: "Le fichier Excel est vide." });
      return;
    }

    let importedCount = 0;

    for (const row of sheetData) {
      const cleanRow: any = {};
      Object.keys(row).forEach((key) => {
        const cleanKey = key.trim().toLowerCase().replace(/[\s_\-\r\n\t]/g, "");
        cleanRow[cleanKey] = row[key];
      });

      const enonce = cleanRow["enonce"] || cleanRow["contexte"] || "Généralités sur la respiration cellulaire";
      const questionText = cleanRow["question"] || cleanRow["text"] || "";
      const typeQuestion = String(cleanRow["type"] || "qcm").toLowerCase().trim();

      if (!questionText || questionText.trim() === "") continue;

      let optionsArray: string[] = [];
      if (typeQuestion === "vrai_faux") {
        optionsArray = ["Vrai", "Faux"];
      } else {
        const optA = cleanRow["optiona"] || cleanRow["opta"] || "";
        const optB = cleanRow["optionb"] || cleanRow["optb"] || "";
        const optC = cleanRow["optionc"] || cleanRow["optc"] || "";
        const optD = cleanRow["optiond"] || cleanRow["optd"] || "";

        optionsArray = [optA, optB, optC, optD]
          .map((o) => String(o).trim())
          .filter((o) => o !== "undefined" && o !== "");
      }

      if (optionsArray.length < 2) {
        optionsArray = ["Option A par défaut", "Option B par défaut"];
      }

      let bonneReponseRaw = cleanRow["bonnereponse"] || cleanRow["correctanswer"] || cleanRow["reponsecorrecte"] || cleanRow["reponse"] || "";
      let correctAnswerText = String(bonneReponseRaw).trim();

      if (!correctAnswerText && optionsArray.length > 0) {
        correctAnswerText = optionsArray[0];
      }

      // Enregistrement en base de données
      await Exercise.create({
        subject,
        chapter,
        contextText: enonce,
        contextImage: "",
        isWhiteExam: checkWhiteExam, // 🚨 ON ASSIGNE LA VALEUR ICI
        subQuestions: [{
          questionText,
          qType: typeQuestion === "vrai_faux" ? "vrai_faux" : "qcm",
          options: optionsArray,
          correctAnswer: correctAnswerText,
          explanation: cleanRow["explication"] || cleanRow["explanation"] || "Valable"
        }]
      });

      importedCount++;
    }

    res.status(200).json({ success: true, message: `Importation réussie de ${importedCount} éléments.` });
  } catch (error) {
    console.error("Erreur import Excel :", error);
    res.status(500).json({ error: "Erreur interne lors du traitement du fichier Excel." });
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
    const { subject, chapter } = req.params;
    // On extrait le paramètre optionnel ?isWhiteExam=true depuis l'URL
    const { isWhiteExam } = req.query; 

    // Construction dynamique du filtre de recherche Mongoose
    const queryFilter: any = { subject, chapter };

    if (isWhiteExam !== undefined) {
      queryFilter.isWhiteExam = isWhiteExam === "true";
    }

    const exercises = await Exercise.find(queryFilter);
    res.json(exercises);
  } catch (error) { 
    res.status(500).json({ error: "Erreur lors de la récupération des données" }); 
  }
});

router.delete("/:id", authenticateAdmin, verifyAdmin, async (req: Request, res: Response) => {
  try {
    await Exercise.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: "Erreur" }); }
});

export default router;