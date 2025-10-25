"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/studentRoutes.ts
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const Exam_1 = __importDefault(require("../models/Exam")); // Modèle des examens
const Result_1 = __importDefault(require("../models/Result")); // Modèle des résultats
const Question_1 = __importDefault(require("../models/Question")); // Modèle des questions
const router = express_1.default.Router();
// 🔹 Profil étudiant
router.get("/profile", authMiddleware_1.authenticateStudent, async (req, res) => {
    res.json({
        id: req.student._id,
        name: req.student.name,
        email: req.student.email,
    });
});
// 🔹 Liste des examens disponibles
router.get("/exams", authMiddleware_1.authenticateStudent, async (req, res) => {
    try {
        const exams = await Exam_1.default.find().select("title date"); // titre et date
        res.json(exams);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});
// 🔹 Questions pour un examen
router.get("/exams/:examId/questions", authMiddleware_1.authenticateStudent, async (req, res) => {
    const { examId } = req.params;
    try {
        const questions = await Question_1.default.find({ exam: examId }).select("text options"); // questions + options
        res.json(questions);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});
// 🔹 Soumettre les réponses d’un examen
router.post("/exams/:examId/submit", authMiddleware_1.authenticateStudent, async (req, res) => {
    const { examId } = req.params;
    const { answers } = req.body; // { questionId: answer }
    try {
        // Calcul du score (exemple simple)
        const questions = await Question_1.default.find({ exam: examId });
        let score = 0;
        questions.forEach(q => {
            if (answers[q._id] && answers[q._id] === q.reponseCorrecte) {
                score += 1;
            }
        });
        // Enregistrer le résultat
        const result = new Result_1.default({
            student: req.student._id,
            exam: examId,
            answers,
            score,
        });
        await result.save();
        res.json({ message: "Examen soumis ✅", score });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});
// 🔹 Historique des résultats
router.get("/results", authMiddleware_1.authenticateStudent, async (req, res) => {
    try {
        const results = await Result_1.default.find({ student: req.student._id }).populate("exam", "title date");
        res.json(results);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});
exports.default = router;
