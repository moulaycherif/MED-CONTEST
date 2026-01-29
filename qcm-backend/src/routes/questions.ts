// routes/questions.ts
import { Router, Request, Response } from "express";
import multer from "multer";
import Question from "../models/Question";

console.log("QUESTIONS FILE:", __filename);


const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Typage des params
interface ExamParams {
  exam: string;
}

// =======================
// 📌 Import Excel
// =======================
router.post("/import-excel", upload.single("file"), async (req, res) => {
   console.log("import-Excel:");
  try {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    const exam = rows[0]["Concours / Examen"];
    const subject = rows[0]["Matière"];

    // 🔥 Nettoyer ancien import
    await Question.deleteMany({ exam, subject });

let currentGroup = null;

for (const row of rows) {
  const texte = (row["Texte de la question"] || "").trim();
  const image = (row["Image"] || "").trim();

  const options = [
    row["Option 1"],
    row["Option 2"],
    row["Option 3"],
    row["Option 4"],
    row["Option 5"],
  ].filter(o => o && o.toString().trim() !== "");

  const hasImage = image.length > 0;
  const hasOptions = options.length > 0;

  console.log("Groupe avec ou sans image:", hasImage, hasOptions);

  // 🟦 1) GROUPE (image seule)
  if (hasImage && !hasOptions) {
    currentGroup = await Question.create({
      image: `/uploads/questions/${image}`,
      subject,
      exam,
      isGroup: true,
    });
    continue;
  }

  // 🟨 2) QUESTION SIMPLE (sans image)
  if (!hasImage && hasOptions) {
    await Question.create({
      texte,
      image: null,
      options,
      reponseCorrecte: row["Réponse correcte"],
      note: Number(row["Note"] || 1),
      subject,
      exam,
      isGroup: false,
      groupId: null,
    });
    continue;
  }

  // 🟩 3) QUESTION D’UN GROUPE
  if (hasImage && hasOptions && currentGroup) {
    await Question.create({
      texte,
      image: null,   // 🔥 PAS d’image ici
      options,
      reponseCorrecte: row["Réponse correcte"],
      note: Number(row["Note"] || 1),
      subject,
      exam,
      isGroup: false,
      groupId: currentGroup._id,
    });
  }
}

    res.json({ message: "Import QCM avec énoncés réussi ✅" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur import Excel" });
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
router.get("/", async (req, res) => {
  const { exam, subject } = req.query;

  const filter: any = { isGroup: false };
  if (exam) filter.exam = exam;
  if (subject) filter.subject = subject;

  const questions = await Question.find(filter).populate("groupId");

  res.json(questions);
});


export default router;
