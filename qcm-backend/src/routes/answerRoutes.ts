import express from "express";
import { correctAnswers } from "../controllers/answerController";

const router = express.Router();

// ✅ Correction du QCM étudiant
router.post("/correct", correctAnswers);

export default router;
