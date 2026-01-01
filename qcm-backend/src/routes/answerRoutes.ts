import express from "express";
import { correctAnswers } from "../controllers/answerController";
import { authenticateStudent } from "../middleware/auth";


const router = express.Router();

// ✅ Correction du QCM étudiant

router.post("/correct", authenticateStudent, correctAnswers);

export default router;
