// controllers/questionController.ts
import { Request, Response } from "express";
import Question from "../models/Question";
import Exam from "../models/Exam";
import XLSX from "xlsx";

/**
 * Récupérer toutes les questions (avec filtres facultatifs)
 * GET /api/questions?exam=2025&subject=Mathématique
 */
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { exam, subject } = req.query;
    const query: any = {};

    if (exam) query.exam = String(exam);
    if (subject) query.subject = String(subject);

    const questions = await Question.find(query);
    res.json(questions);
  } catch (err) {
    console.error("Erreur récupération questions :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération" });
  }
};

/**
 * Importer les questions depuis Excel (multer fournit req.file)
 * POST /api/questions/import
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

    // Mapping des colonnes du template
    const questions = (data as any[])
      .map((row) => ({
        texte: String(row["Texte de la question"] || row["texte"] || "").trim(),
        options: [
          row["Option 1"],
          row["Option 2"],
          row["Option 3"],
          row["Option 4"],
          row["Option 5"],
        ]
          .filter(Boolean)
          .map((o: any) => String(o).trim()),
        reponseCorrecte: String(row["Réponse correcte"] || row["reponseCorrecte"] || "").trim(),
        subject: String(row["Matière"] || row["subject"] || "").trim(),
        exam: String(row["Concours / Examen"] || row["exam"] || "").trim(),
        note: Number(row["Note"] ?? row["note"] ?? 1),
      }))
      .filter(
        (q) =>
          q.texte &&
          q.texte !== "" &&
          Array.isArray(q.options) &&
          q.options.length > 0 &&
          q.reponseCorrecte &&
          q.exam // on exige exam
      );

    if (questions.length === 0) {
      return res.status(400).json({ error: "Aucune question valide trouvée dans le fichier" });
    }

    // Unicité par texte+exam pour éviter dupes
    const uniqueQuestions = [
      ...new Map(questions.map((q) => [q.texte + "|" + q.exam, q])).values(),
    ];

    const exams = [...new Set(uniqueQuestions.map((q) => q.exam))];

    // Modes : replace-global => supprime tout ; replace => supprime questions des exams importés ; append => ajout
    if (mode === "replace-global") {
      await Question.deleteMany({});
    } else if (mode === "replace") {
      await Question.deleteMany({ exam: { $in: exams } });
    }

    // Créer les exam si n'existent pas (on stocke le titre dans `title`)
    for (const ex of exams) {
      const existing = await Exam.findOne({ title: ex });
      if (!existing) {
        await Exam.create({ title: ex, subject: "Général" });
      }
    }

    // InsertMany — ignoreOrdered false pour laisser throw en cas d'erreur de duplicate si besoin
    const inserted = await Question.insertMany(uniqueQuestions, { ordered: false });

    res.json({
      message: "✅ Import réussi",
      inserted: Array.isArray(inserted) ? inserted.length : 0,
      exams,
    });
  } catch (err: any) {
    console.error("Erreur importExcel :", err);
    // si erreur de duplicate key, renvoyer message friendly
    if (err.code === 11000) {
      return res.status(400).json({
        error: "⚠️ Certaines questions existent déjà pour ce concours.",
      });
    }
    res.status(500).json({ error: "Erreur lors de l'import du fichier", details: err.message });
  }
};

/**
 * Liste des examens existants (renvoie les titres)
 */
export const getExams = async (_req: Request, res: Response) => {
  try {
    const exams = await Exam.find().sort({ title: 1 });
    res.json(exams.map((e) => e.title));
  } catch (err) {
    console.error("Erreur récupération examens :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * Liste des matières d’un examen donné
 * GET /api/questions/subjects/:exam
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

// Alias pour rétro-compatibilité
export const importQuestions = importExcel;
