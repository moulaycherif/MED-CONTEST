import { Request, Response } from "express";
import Question from "../models/Question";
import Exam from "../models/Exam";
import XLSX from "xlsx";

console.log("🔥 QUESTION CONTROLLER LOADED");
console.log("🚨 VERSION QUESTION CONTROLLER 2026-FINAL-GROUP-IMPORT");

/* ============================================================
   🔧 UTILITAIRES
============================================================ */

const normalize = (s: string) =>
  s
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

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

    const filter: any = { isGroup: false };

    if (exam) {
      filter.exam = { $regex: new RegExp(`^${exam.trim()}$`, "i") };
    }
    if (subject) {
      filter.subject = { $regex: new RegExp(`^${subject.trim()}$`, "i") };
    }

    const questions = await Question.find(filter)
      .populate("groupId")
      .sort({ _id: 1 });

    res.json(questions);
  } catch (err) {
    console.error("❌ getQuestions error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/* ============================================================
   📥 IMPORT EXCEL — VERSION DÉFINITIVE AVEC GROUPES
============================================================ */

export const importExcel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier fourni" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json<any>(
      workbook.Sheets[sheetName],
      { defval: "" }
    );

    let lastSubject = "";
    let lastExam = "";

    const questions: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const texte = String(getCell(row, "Texte de la question")).trim();
      const imageCell = String(getCell(row, "Image")).trim();
      const subjectCell = String(getCell(row, "Matière")).trim();
      const examCell = String(getCell(row, "Concours / Examen")).trim();

      if (subjectCell) lastSubject = subjectCell;
      if (examCell) lastExam = examCell;

      // ❌ Ligne technique : image seule → on ignore
      if (!texte && imageCell) {
        console.log(`⏭️ Ligne ${i + 2} ignorée (image seule)`);
        continue;
      }

      // ❌ Ligne vide
      if (!texte) continue;

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

      const image = imageCell
        ? `/uploads/questions/${imageCell}.png`
        : null;

      console.log(`✅ QUESTION ${i + 2}`, {
        texte,
        image,
        subject: lastSubject,
        exam: lastExam,
      });

      questions.push({
        texte,
        image,
        options,
        reponseCorrecte,
        subject: lastSubject,
        exam: lastExam,
        note,
        isGroup: false,
        groupId: null,
      });
    }

    if (questions.length === 0) {
      return res.status(400).json({ error: "Aucune question valide" });
    }

    // Nettoyage
    const exams = [...new Set(questions.map(q => q.exam))];
    await Question.deleteMany({ exam: { $in: exams } });

    const inserted = await Question.insertMany(questions);

    res.json({
      message: "✅ Import Excel terminé",
      inserted: inserted.length,
      exams,
    });

  } catch (err: any) {
    console.error("❌ IMPORT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};



/* ============================================================
   📚 AUTRES ROUTES
============================================================ */

export const getExams = async (_req: Request, res: Response) => {
  const exams = await Exam.find().sort({ title: 1 });
  res.json(exams);
};

export const getSubjectsByExam = async (req: Request, res: Response) => {
  const subjects = await Question.distinct("subject", {
    exam: req.params.exam,
  });
  res.json(subjects);
};

export const deleteAllQuestions = async (_req: Request, res: Response) => {
  await Question.deleteMany({});
  res.json({ message: "✅ Toutes les questions supprimées" });
};

// Alias
export const importQuestions = importExcel;
