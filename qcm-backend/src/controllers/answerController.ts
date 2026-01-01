// controllers/answerController.ts
import { Request, Response } from "express";
import Question from "../models/Question";
import StudentActivity from "../models/StudentActivity";


/**
 * Correction du QCM soumis par l'étudiant
 * Endpoint : POST /api/answers/correct
 * Body attendu :
 * {
 *   exam: "2025",
 *   answers: [{ questionId: "...", choice: "Réponse choisie" }, ...]
 * }
 */
export const correctAnswers = async (req: Request, res: Response) => {

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

    const subject = questions[0].subject || "Inconnu";
    const chapter = questions[0].chapter || "";


// On prend la matière & chapitre depuis la 1ère question

    await StudentActivity.create({
      studentId: req.student!._id.toString(),
      type: "QCM",
      subject,
      chapter,
      referenceId: exam,
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
