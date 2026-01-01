// controllers/questionController.ts
import { Request, Response } from "express";
import Question from "../models/Question";
import Exam from "../models/Exam";
import XLSX from "xlsx";

/**
 * Récupérer toutes les questions (avec filtres facultatifs)
 * - exam: "MEDECINE 2023"
 * - subject: "Mathématique"
 * Les filtres sont insensibles à la casse et aux espaces superflus
 */
/**
 * Récupérer toutes les questions (avec filtres facultatifs)
 */
export const getQuestions = async (req: Request, res: Response) => {
  try {
    let { exam, subject } = req.query as { exam?: string; subject?: string };

    console.log("🔥 GET QUESTIONS appelé avec params:", { exam, subject });

    const filter: any = {};

    if (exam) {
      const cleanExam = exam.trim();
      filter.exam = { $regex: new RegExp(`^${cleanExam}$`, "i") };
    }

    if (subject) {
      const cleanSubject = subject.trim();
      filter.subject = { $regex: new RegExp(`^${cleanSubject}$`, "i") };
    }

    const questions = await Question.find(filter).sort({ _id: 1 });

    console.log(`🔥 FOUND QUESTIONS: ${questions.length}`);

    if (questions.length === 0) {
      console.warn("⚠️ Aucune question trouvée pour ces paramètres");
    }

    res.json(questions);
  } catch (err) {
    console.error("❌ getQuestions error:", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des questions" });
  }
};


/**
 * Importer les questions depuis Excel (multer fournit req.file)
 */
export const importExcel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier fourni" });
    }

    const mode = String(req.query.mode || "append"); // append | replace | replace-global
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: "Fichier Excel vide ou mal formé" });
    }

    // 🔹 Mapping des colonnes du template
    const questions = (data as any[])
      .map((row) => ({
        texte: String(row["Texte de la question"] || "").trim(),
        options: [
          row["Option 1"],
          row["Option 2"],
          row["Option 3"],
          row["Option 4"],
          row["Option 5"],
        ]
          .filter(Boolean)
          .map((o: any) => String(o).trim()),
        reponseCorrecte: String(row["Réponse correcte"] || "").trim(),
        subject: String(row["Matière"] || "").trim(),
        exam: String(row["Concours / Examen"] || "").trim(),
        note: Number(row["Note"] ?? 1),
      }))
      .filter(
        (q) =>
          q.texte &&
          q.options.length > 0 &&
          q.reponseCorrecte &&
          q.exam &&
          q.subject
      );

    if (questions.length === 0) {
      return res.status(400).json({ error: "Aucune question valide trouvée dans le fichier" });
    }

    // 🔹 Supprimer selon le mode
    const exams = [...new Set(questions.map((q) => q.exam))];
    if (mode === "replace-global") {
      await Question.deleteMany({});
    } else if (mode === "replace") {
      await Question.deleteMany({ exam: { $in: exams } });
    }

    // 🔹 Créer les examens manquants
    for (const ex of exams) {
      const existing = await Exam.findOne({ title: ex });
      if (!existing) {
        await Exam.create({ title: ex, subject: "Général" });
      }
    }

    // 🔹 Insertion
    const inserted = await Question.insertMany(questions, { ordered: false });

    res.json({
      message: "✅ Import réussi",
      inserted: inserted.length,
      exams,
      subjects: [...new Set(questions.map((q) => q.subject))],
    });
  } catch (err: any) {
    console.error("Erreur importExcel :", err);
    if (err.code === 11000) {
      return res.status(400).json({
        error: "⚠️ Certaines questions existent déjà pour ce concours.",
      });
    }
    res.status(500).json({ error: "Erreur lors de l'import du fichier", details: err.message });
  }
};

/**
 * Liste des examens existants
 */
export const getExams = async (_req: Request, res: Response) => {
  try {
    const exams = await Exam.find().sort({ title: 1 });
    res.json(exams); // 🔥 on renvoie {_id,title}
  } catch (err) {
    console.error("Erreur récupération examens :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


/**
 * Liste des matières d’un examen donné
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
 * Supprimer toutes les questions
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

// Alias
export const importQuestions = importExcel;
