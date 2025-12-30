import express from "express";
import { correctAnswers } from "../controllers/answerController";
import { protect } from "../middleware/auth";


const router = express.Router();

// ✅ Correction du QCM étudiant

router.post("/correct", protect, correctAnswers);

export default router;
