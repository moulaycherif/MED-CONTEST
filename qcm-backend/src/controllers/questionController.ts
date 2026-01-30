import { Request, Response } from "express";
import Question from "../models/Question";
import Exam from "../models/Exam";
import XLSX from "xlsx";
import QuestionGroup from "../models/QuestionGroup.ts";

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
      return res.status(400).json({ message: "Fichier Excel manquant" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let currentGroupId: any = null;
    let groupOrder = 0;
    let questionOrder = 0;

    for (const row of rows) {
      const type = String(row["Type"]).trim().toUpperCase();

      const texte = String(row["Texte de la question"]).trim();
      const image = String(row["Image"]).trim();

      const options = [
        row["Option 1"],
        row["Option 2"],
        row["Option 3"],
        row["Option 4"],
        row["Option 5"],
      ].filter(Boolean);

      const correctAnswer = String(row["Réponse correcte"]).trim();
      const subject = String(row["Matière"]).trim();
      const exam = String(row["Concours / Examen"]).trim();
      const note = Number(row["Note"]) || 1;

      // =========================
      // 🟦 GROUPE (IMAGE)
      // =========================
      if (type === "GROUP") {
        if (!image) {
          throw new Error("Ligne GROUP sans image");
        }

        groupOrder++;

        const group = await QuestionGroup.create({
          image: `/uploads/questions/${image}.png`,
          subject,
          exam,
          order: groupOrder,
        });

        currentGroupId = group._id;
        continue;
      }

      // =========================
      // 🟩 QUESTION SIMPLE
      // =========================
      if (type === "SIMPLE") {
        await Question.create({
          texte,
          options,
          reponseCorrecte: correctAnswer,
          subject,
          exam,
          note,
          groupId: null,
          order: ++questionOrder,
        });

        continue;
      }

      // =========================
      // 🟨 QUESTION DE GROUPE
      // =========================
      if (type === "QUESTION") {
        if (!currentGroupId) {
          throw new Error("QUESTION sans GROUP préalable");
        }

        await Question.create({
          texte,
          options,
          reponseCorrecte: correctAnswer,
          subject,
          exam,
          note,
          groupId: currentGroupId,
          order: ++questionOrder,
        });

        continue;
      }
    }

    res.status(200).json({
      message: "Import Excel terminé avec succès ✅",
    });
  } catch (error: any) {
    console.error("❌ Import Excel error:", error);
    res.status(500).json({
      message: "Erreur lors de l'import Excel",
      error: error.message,
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
