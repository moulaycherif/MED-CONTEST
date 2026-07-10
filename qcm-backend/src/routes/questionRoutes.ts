import express from "express";
import multer from "multer";
import {
  getQuestions,
  importExcel,
  getExams,
  getConcoursBlancs, // 👈 AJOUT de l'import
  getSubjectsByExam,
  deleteAllQuestions,
} from "../controllers/questionController";
import { authenticateStudent } from "../middleware/authMiddleware";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// 📥 Import Excel
router.post("/import", upload.single("file"), importExcel);

// 📄 Questions (filtrables)
router.get("/", authenticateStudent, getQuestions);

// 🎓 Examens officiels
router.get("/exams", authenticateStudent, getExams);

// 📋 👈 NOUVEAU : Liste des numéros de concours blancs
router.get("/exams/blancs", authenticateStudent, getConcoursBlancs);

// 📘 Matières par examen
router.get("/subjects/:exam", authenticateStudent, getSubjectsByExam);

// 🧹 Suppression globale
router.delete("/all", deleteAllQuestions);

export default router;