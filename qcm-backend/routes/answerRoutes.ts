// routes/answerRoutes.ts
import express from "express";
import { correctAnswers } from "../controllers/answerController";

const router = express.Router();

// Route pour corriger le QCM
router.post("/correct", correctAnswers);

export default router;
