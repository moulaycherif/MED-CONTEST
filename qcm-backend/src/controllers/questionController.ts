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
    let currentGroup: any = null;

    const docs: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const texte = String(getCell(row, "Texte de la question")).trim();
      const imageCell = String(getCell(row, "Image")).trim();
      const subjectCell = String(getCell(row, "Matière")).trim();
      const examCell = String(getCell(row, "Concours / Examen")).trim();

      if (subjectCell) lastSubject = subjectCell;
      if (examCell) lastExam = examCell;

      const subject = lastSubject;
      const exam = lastExam;

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

      console.log(`🧪 LIGNE ${i + 2}`, {
        texte,
        imageCell,
        options: options.length,
      });

      /* =============================
         🟦 CAS 1 : GROUPE (image seule)
      ============================== */
      if (!texte && imageCell) {
        currentGroup = {
          image: `/uploads/questions/${imageCell}`,
          subject,
          exam,
          isGroup: true,
        };
        docs.push(currentGroup);
        continue;
      }

      /* =============================
         🟨 CAS 2 : QUESTION SIMPLE
      ============================== */
      if (texte && !imageCell) {
        docs.push({
          texte,
          image: null,
          options,
          reponseCorrecte,
          subject,
          exam,
          note,
          isGroup: false,
          groupId: null,
        });
        continue;
      }

      /* =============================
         🟩 CAS 3 : QUESTION DU GROUPE
      ============================== */
      if (texte && imageCell && currentGroup) {
        docs.push({
          texte,
          image: null, // ⚠️ JAMAIS d’image ici
          options,
          reponseCorrecte,
          subject,
          exam,
          note,
          isGroup: false,
          groupId: null, // temporaire
          __groupRef: currentGroup, // liaison temporaire
        });
      }
    }

    /* =============================
       💾 INSERTION AVEC LIAISON
    ============================== */

    await Question.deleteMany({ exam: lastExam });

    const inserted = [];
    const groupMap = new Map();

    for (const doc of docs) {
      if (doc.isGroup) {
        const g = await Question.create(doc);
        groupMap.set(doc, g._id);
      } else if (doc.__groupRef) {
        doc.groupId = groupMap.get(doc.__groupRef);
        delete doc.__groupRef;
        inserted.push(await Question.create(doc));
      } else {
        inserted.push(await Question.create(doc));
      }
    }

    res.json({
      message: "✅ Import terminé avec images fonctionnelles",
      inserted: inserted.length,
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
