"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.correctAnswers = void 0;
const questionModel_1 = __importDefault(require("../models/questionModel"));
/**
 * Correction du QCM soumis par l'étudiant
 * Endpoint : POST /api/answers/correct
 */
const correctAnswers = async (req, res) => {
    try {
        const { exam, answers } = req.body;
        if (!exam || !Array.isArray(answers)) {
            return res.status(400).json({ error: "Données invalides" });
        }
        // Récupérer toutes les questions de l’examen
        const questions = await questionModel_1.default.find({ exam });
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
    }
    catch (err) {
        console.error("Erreur lors de la correction :", err);
        res.status(500).json({ error: "Erreur lors de la correction" });
    }
};
exports.correctAnswers = correctAnswers;
