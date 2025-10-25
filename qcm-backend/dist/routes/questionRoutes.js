"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const questionController_1 = require("../controllers/questionController");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// 🧩 Récupérer toutes les questions (avec filtres exam/matière)
router.get("/", questionController_1.getQuestions);
// 📥 Importer un fichier Excel de questions
router.post("/import", upload.single("file"), questionController_1.importExcel);
// ⚙️ Alias compatible avec anciennes routes
router.post("/import-legacy", upload.single("file"), questionController_1.importQuestions);
// 🧹 Supprimer toutes les questions
router.delete("/all", questionController_1.deleteAllQuestions);
// 🎓 Récupérer la liste des examens disponibles
router.get("/exams", questionController_1.getExams);
// 📘 Récupérer les matières pour un examen donné
router.get("/subjects/:exam", questionController_1.getSubjectsByExam);
exports.default = router;
