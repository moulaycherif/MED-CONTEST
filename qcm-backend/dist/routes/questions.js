"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/questions.ts
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const Question_1 = __importDefault(require("../models/Question"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// =======================
// 📌 Import Excel
// =======================
router.post("/import-excel", upload.single("file"), async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: "Aucun fichier reçu" });
        const XLSX = await Promise.resolve().then(() => __importStar(require("xlsx")));
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet);
        if (rows.length === 0)
            return res.status(400).json({ error: "Le fichier est vide" });
        // Préparer les questions
        const questions = rows.map(row => ({
            texte: row["Texte de la question"],
            options: [row["Option 1"], row["Option 2"], row["Option 3"], row["Option 4"]],
            reponseCorrecte: row["Réponse correcte"],
            subject: row["Matière"],
            exam: row["Concours / Examen"],
            note: row["Note"] ? Number(row["Note"]) : 1
        }));
        // Supprimer uniquement les questions de cet examen + matière
        const examName = rows[0]["Concours / Examen"];
        const subjectName = rows[0]["Matière"];
        console.log("Import Excel - examen:", examName, "matière:", subjectName);
        await Question_1.default.deleteMany({ exam: examName, subject: subjectName });
        await Question_1.default.insertMany(questions);
        res.json({
            message: `✅ Import réussi : ${questions.length} questions remplacées pour "${examName}" en "${subjectName}"`
        });
    }
    catch (err) {
        console.error("Erreur import Excel :", err);
        res.status(500).json({ error: "Erreur lors de l'import du fichier Excel" });
    }
});
// 📌 Liste des examens distincts
router.get("/exams", async (_req, res) => {
    try {
        const exams = await Question_1.default.distinct("exam");
        console.log("Exams disponibles:", exams);
        res.json(exams);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur récupération examens" });
    }
});
// 📌 Liste des matières distinctes par examen
router.get("/subjects/:exam", async (req, res) => {
    try {
        const { exam } = req.params;
        console.log("Récupérer matières pour examen:", exam);
        const subjects = await Question_1.default.distinct("subject", { exam });
        res.json(subjects);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur récupération matières" });
    }
});
// 📌 Récupérer les questions avec filtres examen et matière
router.get("/", async (req, res) => {
    try {
        const { exam, subject } = req.query;
        const filter = {};
        if (exam)
            filter.exam = exam;
        if (subject)
            filter.subject = subject;
        const questions = await Question_1.default.find(filter);
        res.json(questions);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur récupération questions" });
    }
});
exports.default = router;
