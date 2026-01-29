import express from "express";
import multer from "multer";
import {
  getQuestions,
  importExcel,
  getExams,
  getSubjectsByExam,
  deleteAllQuestions,
} from "../controllers/questionController";

console.log("🔥 QUESTION ROUTES LOADED");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Récupérer toutes les questions (avec filtres exam/matière)
router.get("/", getQuestions);

// 📥 Importer un fichier Excel de questions
router.post("/import", upload.single("file"), importExcel);

// 🎓 Examens
router.get("/exams", getExams);

// 📘 Matières par examen
router.get("/subjects/:exam", getSubjectsByExam);

// 🧹 Suppression globale
router.delete("/all", deleteAllQuestions);

export default router;
