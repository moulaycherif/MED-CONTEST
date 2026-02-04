import { Request, Response } from "express";
import Question from "../models/Question";
import Exam from "../models/Exam";
import QuestionGroup from "../models/QuestionGroup";
import XLSX from "xlsx";

/* ============================================================
   🔧 UTILITAIRES
============================================================ */

const normalize = (s: string) =>
  s
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const getCell = (row: any, key: string) => {
  const expected = normalize(key);
  const found = Object.entries(row).find(
    ([k]) => normalize(k) === expected
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

    const filter: any = {};

    if (exam) {
      filter.exam = { $regex: new RegExp(`^${exam.trim()}$`, "i") };
    }
    if (subject) {
      filter.subject = { $regex: new RegExp(`^${subject.trim()}$`, "i") };
    }

    const questions = await Question.find(filter)
  .populate({
    path: "groupId",
    model: "QuestionGroup",
    select: "image subject exam order",
  })
  .sort({ "groupId.order": 1, _id: 1 })
  .lean();

    res.json(questions);
  } catch (err) {
    console.error("❌ getQuestions error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


/* ============================================================
   📥 IMPORT EXCEL — GROUPES + QUESTIONS (ROBUSTE)
============================================================ */

export const importExcel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Fichier Excel manquant" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json<any>(
      workbook.Sheets[sheetName],
      { defval: "" }
    );

    // ✅ PURGE UNE SEULE FOIS
    await Question.deleteMany({});
    await QuestionGroup.deleteMany({});

    let lastSubject = "";
    let lastExam = "";
    let currentGroup: any = null;
    let groupOrder = 0;
    let questionOrder = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const type = String(getCell(row, "Type")).trim().toUpperCase();

      const texte = String(getCell(row, "Texte de la question")).trim();
      const imageCell = String(getCell(row, "Image")).trim();
      const subjectCell = String(getCell(row, "Matière")).trim();
      const examCell = String(getCell(row, "Concours / Examen")).trim();

      if (subjectCell) lastSubject = subjectCell;
      if (examCell) lastExam = examCell;

      // 🔒 Sécurité ABSOLUE
      if (!lastSubject || !lastExam) {
        console.warn(`⛔ Ligne ${i + 2} ignorée (matière/examen manquant)`);
        continue;
      }

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

      /* ======================================================
         🟦 CAS 1 — IMAGE SEULE → GROUPE
      ====================================================== */
      if (type === "GROUP") {
  if (!imageCell) {
    throw new Error(`GROUP sans image ligne ${i + 2}`);
  }

  groupOrder++;

  currentGroup = await QuestionGroup.create({
    image: `/uploads/questions/${imageCell}.png`,
    subject: lastSubject,
    exam: lastExam,
    order: groupOrder,
  });

  continue;
}

      /* ======================================================
         🟩 CAS 2 — QUESTION SIMPLE (sans groupe)
      ====================================================== */
      if (type === "SIMPLE") {
  await Question.create({
    texte,
    image: null,
    options,
    reponseCorrecte,
    subject: lastSubject,
    exam: lastExam,
    note,
    groupId: null,
    order: ++questionOrder,
  });

  continue;
}

      /* ======================================================
         🟨 CAS 3 — QUESTION DE GROUPE (texte + image)
      ====================================================== */
      if (type === "QUESTION") {
  if (!currentGroup) {
    throw new Error(`QUESTION sans GROUP ligne ${i + 2}`);
  }

  await Question.create({
    texte,
    image: null,
    options,
    reponseCorrecte,
    subject: lastSubject,
    exam: lastExam,
    note,
    groupId: currentGroup._id,
    order: ++questionOrder,
  });

  continue;
}
    }

    res.json({
      message: "✅ Import Excel terminé avec succès",
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
  await QuestionGroup.deleteMany({});
  res.json({ message: "✅ Toutes les questions supprimées" });
};

// Alias
export const importQuestions = importExcel;
