import express from "express";
import multer from "multer";
import {
  getQuestions,
  importExcel,
  getExams,
  getSubjectsByExam,
  deleteAllQuestions,
} from "../controllers/questionController";
import { authenticateStudent } from "../middleware/authMiddleware";

const router = express.Router();

// ⬅️ memoryStorage OBLIGATOIRE pour XLSX
const upload = multer({ storage: multer.memoryStorage() });

// 📥 Import Excel
router.post("/import", upload.single("file"), importExcel);

// 📄 Questions (filtrables exam / matière)
router.get("/", authenticateStudent, getQuestions);

// 🎓 Examens
router.get("/exams", authenticateStudent, getExams);

// 📘 Matières par examen
router.get("/subjects/:exam", authenticateStudent, getSubjectsByExam);

// 🧹 Suppression globale
router.delete("/all", deleteAllQuestions);

export default router;
