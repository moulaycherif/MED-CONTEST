// controllers/questionController.ts
import { Request, Response } from "express";
import Question from "../models/Question";
import Exam from "../models/Exam";
import XLSX from "xlsx";

console.log("🔥 QUESTION CONTROLLER LOADED");
console.log("🚨 VERSION QUESTION CONTROLLER 2026-FINAL-IMPORT-FIX");

/* ============================================================
   🔧 UTILITAIRES
============================================================ */

// normalisation ultra robuste des clés Excel
const normalize = (s: string) =>
  s
    .replace(/\u00A0/g, " ") // espaces insécables
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// accès robuste à une cellule Excel
const getCell = (row: any, expectedKey: string) => {
  const expected = normalize(expectedKey);
  const found = Object.entries(row).find(
    ([key]) => normalize(key) === expected
  );
  return found ? found[1] : "";
};

/* ============================================================
   📥 GET QUESTIONS
============================================================ */

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { exam, subject } = req.query as {
      exam?: string;
      subject?: string;
    };

    console.log("🔥 GET QUESTIONS", { exam, subject });

    const filter: any = {};

    if (exam) {
      filter.exam = { $regex: new RegExp(`^${exam.trim()}$`, "i") };
    }

    if (subject) {
      filter.subject = { $regex: new RegExp(`^${subject.trim()}$`, "i") };
    }

    const questions = await Question.find(filter).sort({ _id: 1 });
    console.log("📊 QUESTIONS FOUND:", questions.length);

    res.json(questions);
  } catch (err) {
    console.error("❌ getQuestions error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/* ============================================================
   📥 IMPORT EXCEL (VERSION DÉFINITIVE)
============================================================ */

export const importExcel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier fourni" });
    }

    const mode = String(req.query.mode || "append");

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];

    const rawData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName],
      { defval: "" }
    );

    if (!Array.isArray(rawData) || rawData.length === 0) {
      return res.status(400).json({ error: "Fichier Excel vide" });
    }

    console.log("📥 LIGNES EXCEL:", rawData.length);
    console.log("🧪 COLONNES DÉTECTÉES:", Object.keys(rawData[0]));

    /* ------------------------------------------------------------
       🔎 PHASE 1 : lecture brute + logs (CRUCIAL)
    ------------------------------------------------------------ */

    let lastSubject = "";
    let lastExam = "";

    const parsed = rawData.map((row: any, index: number) => {
      const rawSubject = String(getCell(row, "Matière")).trim();
      const rawExam = String(getCell(row, "Concours / Examen")).trim();

      // ⚠️ héritage UNIQUEMENT si cellule vide (Excel fusionné)
      if (rawSubject) lastSubject = rawSubject;
      if (rawExam) lastExam = rawExam;

      const subject = rawSubject || lastSubject;
      const exam = rawExam || lastExam;

      const texte = String(getCell(row, "Texte de la question")).trim();
      const imageName = String(getCell(row, "Image")).trim();

      const options = [
        getCell(row, "Option 1"),
        getCell(row, "Option 2"),
        getCell(row, "Option 3"),
        getCell(row, "Option 4"),
        getCell(row, "Option 5"),
      ]
        .map(o => String(o).trim())
        .filter(Boolean);

      const reponseCorrecte = String(
        getCell(row, "Réponse correcte")
      ).trim();

      const note = Number(getCell(row, "Note") || 1);

      // 🔥 LOG ABSOLU (preuve irréfutable)
      console.log(`🧪 RAW LIGNE ${index + 2}`, {
        exam,
        subject,
        texte: texte.slice(0, 30),
        options: options.length,
      });

      return {
        texte,
        image: imageName ? `/uploads/questions/${imageName}.png` : null,
        options,
        reponseCorrecte,
        subject,
        exam,
        note,
      };
    });

    /* ------------------------------------------------------------
       🔎 PHASE 2 : filtrage strict
    ------------------------------------------------------------ */

    const questions = parsed.filter(q =>
      (q.texte || q.image) &&
      q.options.length > 0 &&
      q.reponseCorrecte &&
      q.subject &&
      q.exam
    );

    if (questions.length === 0) {
      return res.status(400).json({
        error: "Aucune question valide après parsing",
      });
    }

    /* ------------------------------------------------------------
       🧹 SUPPRESSION SELON MODE
    ------------------------------------------------------------ */

    const exams = [...new Set(questions.map(q => q.exam))];

    if (mode === "replace-global") {
      await Question.deleteMany({});
    } else if (mode === "replace") {
      await Question.deleteMany({ exam: { $in: exams } });
    }

    /* ------------------------------------------------------------
       📘 CRÉATION DES EXAMS
    ------------------------------------------------------------ */

    for (const ex of exams) {
      const exists = await Exam.findOne({ title: ex });
      if (!exists) {
        await Exam.create({ title: ex, subject: "Général" });
      }
    }

    console.log("📘 EXAMS IMPORTÉS:", exams);
    console.log(
      "📗 MATIÈRES IMPORTÉES:",
      [...new Set(questions.map(q => q.subject))]
    );

    /* ------------------------------------------------------------
       💾 INSERTION
    ------------------------------------------------------------ */

    const inserted = await Question.insertMany(questions, {
      ordered: false,
    });

    res.json({
      message: "✅ Import Excel terminé avec succès",
      inserted: inserted.length,
      exams,
      subjects: [...new Set(questions.map(q => q.subject))],
    });

  } catch (err: any) {
    console.error("❌ IMPORT ERROR:", err);
    res.status(500).json({
      error: "Erreur import Excel",
      details: err.message,
    });
  }
};

/* ============================================================
   📚 AUTRES ROUTES
============================================================ */

export const getExams = async (_req: Request, res: Response) => {
  try {
    const exams = await Exam.find().sort({ title: 1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération examens" });
  }
};

export const getSubjectsByExam = async (req: Request, res: Response) => {
  try {
    const { exam } = req.params;
    const subjects = await Question.distinct("subject", { exam });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération matières" });
  }
};

export const deleteAllQuestions = async (_req: Request, res: Response) => {
  try {
    await Question.deleteMany({});
    res.json({ message: "✅ Toutes les questions supprimées" });
  } catch (err) {
    res.status(500).json({ error: "Erreur suppression" });
  }
};

// Alias
export const importQuestions = importExcel;
