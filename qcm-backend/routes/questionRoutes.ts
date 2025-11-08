import express from "express";
import multer from "multer";
import {
  getQuestions,
  importExcel,
  importQuestions,
  getExams,
  getSubjectsByExam,
  deleteAllQuestions,
} from "../controllers/questionController";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Récupérer toutes les questions (avec filtres exam/matière)
router.get("/", getQuestions);

// 📥 Importer un fichier Excel de questions
router.post("/import", upload.single("file"), importExcel);

// ⚙️ Alias compatible avec anciennes routes
router.post("/import-legacy", upload.single("file"), importQuestions);

// 🎓 Récupérer la liste des examens disponibles
router.get("/exams", getExams);

// 📘 Récupérer les matières pour un examen donné
router.get("/subjects/:exam", getSubjectsByExam);

// 🧹 Supprimer toutes les questions
router.delete("/all", deleteAllQuestions);

export default router;
