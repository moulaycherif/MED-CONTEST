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

    const mode = String(req.query.mode || "append");
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];

    const rows = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName],
      { defval: "" }
    );

    if (!rows.length) {
      return res.status(400).json({ error: "Fichier Excel vide" });
    }

    let lastExam = "";
    let lastSubject = "";
    let currentGroupId: any = null;

    const questionsToInsert: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row: any = rows[i];

      const rawExam = String(getCell(row, "Concours / Examen")).trim();
      const rawSubject = String(getCell(row, "Matière")).trim();

      if (rawExam) lastExam = rawExam;
      if (rawSubject) lastSubject = rawSubject;

      const exam = lastExam;
      const subject = lastSubject;

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

      const hasImage = !!imageName;
      const hasOptions = options.length > 0;

      console.log(`📌 LIGNE ${i + 2}`, {
        exam,
        subject,
        hasImage,
        hasOptions,
      });

      // 🟦 GROUPE (image seule)
      if (hasImage && !hasOptions && !texte) {
        const group = await Question.create({
          image: `/uploads/questions/${imageName}.png`,
          exam,
          subject,
          isGroup: true,
        });
        currentGroupId = group._id;
        continue;
      }

      // 🟨 QUESTION SIMPLE
      if (!hasImage && hasOptions) {
        questionsToInsert.push({
          texte,
          image: null,
          options,
          reponseCorrecte,
          note,
          exam,
          subject,
          isGroup: false,
          groupId: null,
        });
        continue;
      }

      // 🟩 QUESTION D’UN GROUPE
      if (hasOptions && currentGroupId) {
        questionsToInsert.push({
          texte,
          image: null,
          options,
          reponseCorrecte,
          note,
          exam,
          subject,
          isGroup: false,
          groupId: currentGroupId,
        });
      }
    }

    if (!questionsToInsert.length) {
      return res.status(400).json({ error: "Aucune question valide" });
    }

    const exams = [...new Set(questionsToInsert.map(q => q.exam))];

    if (mode === "replace-global") {
      await Question.deleteMany({});
    } else if (mode === "replace") {
      await Question.deleteMany({ exam: { $in: exams } });
    }

    for (const ex of exams) {
      const exists = await Exam.findOne({ title: ex });
      if (!exists) {
        await Exam.create({ title: ex, subject: "Général" });
      }
    }

    const inserted = await Question.insertMany(questionsToInsert, {
      ordered: false,
    });

    res.json({
      message: "✅ Import Excel avec groupes réussi",
      inserted: inserted.length,
      exams,
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
