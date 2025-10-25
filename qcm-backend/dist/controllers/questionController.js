"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importQuestions = exports.deleteAllQuestions = exports.getSubjectsByExam = exports.getExams = exports.importExcel = exports.getQuestions = void 0;
const questionModel_1 = __importDefault(require("../models/questionModel"));
const examModel_1 = __importDefault(require("../models/examModel"));
const xlsx_1 = __importDefault(require("xlsx"));
/**
 * ✅ Récupérer toutes les questions (avec filtres facultatifs)
 */
const getQuestions = async (req, res) => {
    try {
        const { exam, subject } = req.query;
        const query = {};
        if (exam)
            query.exam = exam;
        if (subject)
            query.subject = subject;
        const questions = await questionModel_1.default.find(query);
        res.json(questions);
    }
    catch (err) {
        console.error("Erreur récupération questions :", err);
        res.status(500).json({ error: "Erreur serveur lors de la récupération" });
    }
};
exports.getQuestions = getQuestions;
/**
 * ✅ Importer les questions depuis Excel
 */
const importExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Aucun fichier fourni" });
        }
        const mode = req.query.mode || "append"; // append | replace | replace-global
        const workbook = xlsx_1.default.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheetName]);
        if (data.length === 0) {
            return res.status(400).json({ error: "Fichier Excel vide" });
        }
        const questions = data
            .map((row) => ({
            texte: String(row["Texte de la question"] || "").trim(),
            options: [
                row["Option 1"],
                row["Option 2"],
                row["Option 3"],
                row["Option 4"],
                row["Option 5"],
            ].filter(Boolean),
            reponseCorrecte: String(row["Réponse correcte"] || "").trim(),
            subject: String(row["Matière"] || "").trim(),
            exam: String(row["Concours / Examen"] || "").trim(),
            note: Number(row["Note"] || 1),
        }))
            .filter((q) => q.texte &&
            q.texte.trim() !== "" &&
            q.options.length > 0 &&
            q.reponseCorrecte &&
            q.exam &&
            q.subject);
        if (questions.length === 0) {
            return res
                .status(400)
                .json({ error: "Aucune question valide trouvée dans le fichier" });
        }
        const uniqueQuestions = [
            ...new Map(questions.map((q) => [q.texte + "|" + q.exam, q])).values(),
        ];
        const exams = [...new Set(uniqueQuestions.map((q) => q.exam))];
        if (mode === "replace-global") {
            await questionModel_1.default.deleteMany({});
        }
        else if (mode === "replace") {
            await questionModel_1.default.deleteMany({ exam: { $in: exams } });
        }
        for (const ex of exams) {
            const existing = await examModel_1.default.findOne({ nom: ex });
            if (!existing) {
                await examModel_1.default.create({ nom: ex });
            }
        }
        const result = await questionModel_1.default.insertMany(uniqueQuestions, { ordered: false });
        res.json({
            message: "✅ Import réussi",
            inserted: result.length,
            exams,
        });
    }
    catch (err) {
        console.error("Erreur importExcel :", err);
        if (err.code === 11000) {
            return res.status(400).json({
                error: "⚠️ Certaines questions existent déjà pour ce concours.",
            });
        }
        res.status(500).json({ error: "Erreur lors de l'import du fichier" });
    }
};
exports.importExcel = importExcel;
/**
 * ✅ Liste des examens existants
 */
const getExams = async (_req, res) => {
    try {
        const exams = await examModel_1.default.find().sort({ nom: 1 });
        res.json(exams.map((e) => e.nom));
    }
    catch (err) {
        console.error("Erreur récupération examens :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.getExams = getExams;
/**
 * ✅ Liste des matières d’un examen donné
 */
const getSubjectsByExam = async (req, res) => {
    try {
        const { exam } = req.params;
        if (!exam) {
            return res.status(400).json({ error: "Paramètre 'exam' manquant" });
        }
        const subjects = await questionModel_1.default.distinct("subject", { exam });
        res.json(subjects);
    }
    catch (err) {
        console.error("Erreur récupération matières :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.getSubjectsByExam = getSubjectsByExam;
/**
 * 🧹 Supprimer toutes les questions
 */
const deleteAllQuestions = async (_req, res) => {
    try {
        await questionModel_1.default.deleteMany({});
        res.json({ message: "✅ Toutes les questions ont été supprimées." });
    }
    catch (err) {
        console.error("Erreur deleteAllQuestions :", err);
        res.status(500).json({ error: "Erreur suppression globale" });
    }
};
exports.deleteAllQuestions = deleteAllQuestions;
// 🧩 Alias
exports.importQuestions = exports.importExcel;
