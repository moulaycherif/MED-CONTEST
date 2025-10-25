import { Request, Response } from "express";
import Question from "../models/questionModel";
import Exam from "../models/examModel";
import XLSX from "xlsx";

/**
 * ✅ Récupérer toutes les questions (avec filtres facultatifs)
 */
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { exam, subject } = req.query;
    const query: any = {};

    if (exam) query.exam = exam;
    if (subject) query.subject = subject;

    const questions = await Question.find(query);
    res.json(questions);
  } catch (err) {
    console.error("Erreur récupération questions :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération" });
  }
};

/**
 * ✅ Importer les questions depuis Excel
 */
export const importExcel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier fourni" });
    }

    const mode = req.query.mode || "append"; // append | replace | replace-global
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length === 0) {
      return res.status(400).json({ error: "Fichier Excel vide" });
    }

    const questions = data
      .map((row: any) => ({
        texte: String(row["Texte de la question"] || "").trim(),
        options: [
          row["Option 1"],
          row["Option 2"],
          row["Option 3"],
          row["Option 4"],
          row["Option 5"],
        ].filter(Boolean),
        reponseCorrecte: String(row["Réponse correcte"] || "").trim(),
        subject: String(row["Matière"] || "").trim(),
        exam: String(row["Concours / Examen"] || "").trim(),
        note: Number(row["Note"] || 1),
      }))
      .filter(
        (q) =>
          q.texte &&
          q.texte.trim() !== "" &&
          q.options.length > 0 &&
          q.reponseCorrecte &&
          q.exam &&
          q.subject
      );

    if (questions.length === 0) {
      return res
        .status(400)
        .json({ error: "Aucune question valide trouvée dans le fichier" });
    }

    const uniqueQuestions = [
      ...new Map(questions.map((q) => [q.texte + "|" + q.exam, q])).values(),
    ];

    const exams = [...new Set(uniqueQuestions.map((q) => q.exam))];

    if (mode === "replace-global") {
      await Question.deleteMany({});
    } else if (mode === "replace") {
      await Question.deleteMany({ exam: { $in: exams } });
    }

    for (const ex of exams) {
      const existing = await Exam.findOne({ nom: ex });
      if (!existing) {
        await Exam.create({ nom: ex });
      }
    }

    const result = await Question.insertMany(uniqueQuestions, { ordered: false });

    res.json({
      message: "✅ Import réussi",
      inserted: result.length,
      exams,
    });
  } catch (err: any) {
    console.error("Erreur importExcel :", err);
    if (err.code === 11000) {
      return res.status(400).json({
        error: "⚠️ Certaines questions existent déjà pour ce concours.",
      });
    }
    res.status(500).json({ error: "Erreur lors de l'import du fichier" });
  }
};

/**
 * ✅ Liste des examens existants
 */
export const getExams = async (_req: Request, res: Response) => {
  try {
    const exams = await Exam.find().sort({ nom: 1 });
    res.json(exams.map((e) => e.nom));
  } catch (err) {
    console.error("Erreur récupération examens :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * ✅ Liste des matières d’un examen donné
 */
export const getSubjectsByExam = async (req: Request, res: Response) => {
  try {
    const { exam } = req.params;
    if (!exam) {
      return res.status(400).json({ error: "Paramètre 'exam' manquant" });
    }

    const subjects = await Question.distinct("subject", { exam });
    res.json(subjects);
  } catch (err) {
    console.error("Erreur récupération matières :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * 🧹 Supprimer toutes les questions
 */
export const deleteAllQuestions = async (_req: Request, res: Response) => {
  try {
    await Question.deleteMany({});
    res.json({ message: "✅ Toutes les questions ont été supprimées." });
  } catch (err) {
    console.error("Erreur deleteAllQuestions :", err);
    res.status(500).json({ error: "Erreur suppression globale" });
  }
};

// 🧩 Alias
export const importQuestions = importExcel;
