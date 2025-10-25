// controllers/answerController.ts
import { Request, Response } from "express";
import Question from "../models/questionModel";

/**
 * Correction du QCM soumis par l'étudiant
 * Endpoint : POST /api/answers/correct
 */
export const correctAnswers = async (req: Request, res: Response) => {
  try {
    const { exam, answers } = req.body;

    if (!exam || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Données invalides" });
    }

    // Récupérer toutes les questions de l’examen
    const questions = await Question.find({ exam });

    let totalScore = 0;
    let correctCount = 0;

    for (const q of questions) {
      const studentAnswer = answers.find((a) => a.questionId === q._id.toString());
      if (studentAnswer && studentAnswer.choice === q.reponseCorrecte) {
        correctCount++;
        totalScore += q.note ?? 1;
      }
    }

    res.json({
      message: "✅ Correction effectuée avec succès",
      score: correctCount,
      totalQuestions: questions.length,
      totalScore,
    });
  } catch (err) {
    console.error("Erreur lors de la correction :", err);
    res.status(500).json({ error: "Erreur lors de la correction" });
  }
};
