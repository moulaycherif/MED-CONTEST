// routes/questions.ts
import { Router, Request, Response } from "express";
import multer from "multer";
import Question from "../models/Question";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Typage des params
interface ExamParams {
  exam: string;
}

// =======================
// 📌 Import Excel
// =======================
router.post("/import-excel", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });

    const XLSX = await import("xlsx");
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows: any[] = XLSX.utils.sheet_to_json(worksheet);
    if (rows.length === 0) return res.status(400).json({ error: "Le fichier est vide" });

    // Préparer les questions
    const questions = rows.map(row => ({
      texte: row["Texte de la question"],
      options: [row["Option 1"], row["Option 2"], row["Option 3"], row["Option 4"]],
      reponseCorrecte: row["Réponse correcte"],
      subject: row["Matière"],
      exam: row["Concours / Examen"],
      note: row["Note"] ? Number(row["Note"]) : 1
    }));

    // Supprimer uniquement les questions de cet examen + matière
    const examName = rows[0]["Concours / Examen"];
    const subjectName = rows[0]["Matière"];
    console.log("Import Excel - examen:", examName, "matière:", subjectName);
    await Question.deleteMany({ exam: examName, subject: subjectName });

    await Question.insertMany(questions);

    res.json({
      message: `✅ Import réussi : ${questions.length} questions remplacées pour "${examName}" en "${subjectName}"`
    });

  } catch (err) {
    console.error("Erreur import Excel :", err);
    res.status(500).json({ error: "Erreur lors de l'import du fichier Excel" });
  }
});

// 📌 Liste des examens distincts
router.get("/exams", async (_req: Request, res: Response) => {
  try {
    const exams = await Question.distinct("exam");
    console.log("Exams disponibles:", exams);
    res.json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur récupération examens" });
  }
});

// 📌 Liste des matières distinctes par examen
router.get(
  "/subjects/:exam",
  async (req: Request<ExamParams, any, any, any>, res: Response) => {
    try {
      const { exam } = req.params;
      console.log("Récupérer matières pour examen:", exam);
      const subjects = await Question.distinct("subject", { exam });
      res.json(subjects);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur récupération matières" });
    }
  }
);

// 📌 Récupérer les questions avec filtres examen et matière
router.get("/", async (req: Request, res: Response) => {
  try {
    const { exam, subject } = req.query as { exam?: string; subject?: string };
    const filter: any = {};
    if (exam) filter.exam = exam;
    if (subject) filter.subject = subject;

    const questions = await Question.find(filter);
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur récupération questions" });
  }
});

export default router;
