"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/authRoutes.ts
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Student_1 = __importDefault(require("../models/Student"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = express_1.default.Router();
const SECRET = "super_secret_key"; // à placer dans .env
// 🔹 Inscription
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newStudent = new Student_1.default({ name, email, password: hashedPassword });
        await newStudent.save();
        res.json({ message: "Compte créé avec succès ✅" });
    }
    catch (err) {
        res.status(400).json({ error: "Erreur d'inscription" });
    }
});
// 🔹 Connexion
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await Student_1.default.findOne({ email });
        if (!student)
            return res.status(400).json({ error: "Utilisateur non trouvé" });
        const isMatch = await bcryptjs_1.default.compare(password, student.password);
        if (!isMatch)
            return res.status(400).json({ error: "Mot de passe incorrect" });
        const token = jsonwebtoken_1.default.sign({ id: student._id }, SECRET, { expiresIn: "2h" });
        res.json({ token, student });
    }
    catch {
        res.status(500).json({ error: "Erreur serveur" });
    }
});
exports.default = router;
