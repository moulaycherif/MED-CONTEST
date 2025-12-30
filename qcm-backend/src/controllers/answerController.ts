// controllers/answerController.ts
import { Request, Response } from "express";
import Question from "../models/Question";
import StudentActivity from "../models/StudentActivity";
import { AuthRequest } from "../middleware/auth";


/**
 * Correction du QCM soumis par l'étudiant
 * Endpoint : POST /api/answers/correct
 * Body attendu :
 * {
 *   exam: "2025",
 *   answers: [{ questionId: "...", choice: "Réponse choisie" }, ...]
 * }
 */
export const correctAnswers = async (req: AuthRequest, res: Response) => {

  try {
    const { exam, answers } = req.body;

    if (!exam || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Données invalides — exam et answers requis" });
    }

    // Récupérer toutes les questions de l’examen
    const questions = await Question.find({ exam });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: "Aucune question trouvée pour cet examen" });
    }

    let totalScore = 0;
    let correctCount = 0;

    for (const q of questions) {
      const studentAnswer = answers.find((a: any) => a.questionId === q._id.toString());
      if (studentAnswer && studentAnswer.choice === q.reponseCorrecte) {
        correctCount++;
        totalScore += q.note ?? 1;
      }
    }

    const studentId = req.user!.id;

// On prend la matière & chapitre depuis la 1ère question
const firstQuestion = questions[0];

await StudentActivity.create({
  studentId,
  type: "QCM",
  subject: firstQuestion.subject,
  chapter: firstQuestion.chapter,
  referenceId: exam,
  createdAt: new Date()
});


    res.json({
      message: "✅ Correction effectuée avec succès",
      correctCount,
      totalQuestions: questions.length,
      totalScore,
    });
  } catch (err) {
    console.error("Erreur lors de la correction :", err);
    res.status(500).json({ error: "Erreur lors de la correction" });
  }
};
export default correctAnswers;
