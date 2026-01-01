import express from "express";
import { authenticateStudent, AuthenticatedRequest } from "../middleware/authMiddleware";
import Exam from "../models/Exam";
import Result from "../models/Result";
import Question from "../models/Question";
import StudentActivity from "../models/StudentActivity";

const router = express.Router();

// 🔹 Profil étudiant
router.get("/profile", authenticateStudent, async (req: AuthenticatedRequest, res) => {
  res.json({
    id: req.student!._id,
    name: req.student!.name,
    email: req.student!.email,
  });
});

// 🔹 Liste des examens disponibles
router.get("/exams", authenticateStudent, async (req: AuthenticatedRequest, res) => {
  try {
    const exams = await Exam.find().select("title date");
    res.json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Questions pour un examen
router.get("/exams/:examId/questions", authenticateStudent, async (req, res) => {
  const { examId } = req.params;

  const exam = await Exam.findById(examId);
  if (!exam) return res.status(404).json({ error: "Examen introuvable" });

  const questions = await Question.find({ exam: exam.title });

  console.log("🔥 QUESTIONS appelé par", req.student.email, "→", exam.title);

  res.json(questions);
});


// 🔹 Soumettre les réponses d’un examen (QCM)
router.post("/exams/:examId/submit", authenticateStudent, async (req: AuthenticatedRequest, res) => {
  console.log("🔥 QCM SUBMIT appelé par", req.student?.email);
  try {
    const { examId } = req.params;
    const { answers } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "Examen introuvable" });

    const questions = await Question.find({ exam: exam.title });
    let score = 0;
    questions.forEach(q => {
      const qid = q._id.toString();   // 🔥 CRITIQUE
      if (answers[qid] === q.reponseCorrecte) {
        score += q.note || 1;
      }
    });

    await Result.create({
      student: req.student!._id,
      exam: examId,
      answers,
      score,
    });

    // 🔥 ENREGISTREMENT DE L’ACTIVITÉ QCM
    if (questions.length > 0) {
      console.log("🔥 QCM enregistré pour", req.student._id.toString(), questions[0].subject);

      await StudentActivity.create({
        student: req.student._id,      // 🔥 PAS studentId
        type: "QCM",
        subject: questions[0].subject,
        referenceId: examId,
      });
    }

    res.json({ message: "Examen soumis ✅", score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Historique des résultats
router.get("/results", authenticateStudent, async (req: AuthenticatedRequest, res) => {
  try {
    const results = await Result.find({ student: req.student!._id }).populate("exam", "title date");
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
