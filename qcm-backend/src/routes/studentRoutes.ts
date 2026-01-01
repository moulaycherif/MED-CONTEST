// routes/studentRoutes.ts
import express from "express";
import { authenticateStudent} from "../middleware/authMiddleware";
import Exam from "../models/Exam"; // Modèle des examens
import Result from "../models/Result"; // Modèle des résultats
import Question from "../models/Question"; // Modèle des questions
import StudentActivity from "../models/StudentActivity";


const router = express.Router();

// 🔹 Profil étudiant
router.get("/profile", authenticateStudent, async (req, res) => {
  res.json({
    id: req.student._id,
    name: req.student.name,
    email: req.student.email,
  });
});

// 🔹 Liste des examens disponibles
router.get("/exams", authenticateStudent, async (req, res) => {
  try {
    const exams = await Exam.find().select("title date"); // titre et date
    res.json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Questions pour un examen
router.get("/exams/:examId/questions", authenticateStudent, async (req, res) => {
  const { examId } = req.params;
  try {
    const questions = await Question.find({ exam: examId }).select("text options"); // questions + options
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Soumettre les réponses d’un examen
router.post("/exams/:examId/submit", authenticateStudent, async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "Examen introuvable" });

    // 🔥 clé réelle utilisée par les questions
    const questions = await Question.find({ exam: exam.title });

    let score = 0;
    questions.forEach(q => {
      if (answers[q._id] === q.reponseCorrecte) score += q.note;
    });

    await Result.create({
      student: req.student._id,
      exam: examId,
      answers,
      score,
    });

    // 🔥 ENREGISTREMENT DE L’ACTIVITÉ QCM
    if (questions.length > 0) {
      await StudentActivity.create({
        studentId: req.student._id.toString(),
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
router.get("/results", authenticateStudent, async (req, res) => {
  try {
    const results = await Result.find({ student: req.student._id }).populate("exam", "title date");
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
