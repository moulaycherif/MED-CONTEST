"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/authRoutes.ts
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const Student_1 = __importDefault(require("../models/Student"));
const Admin_1 = __importDefault(require("../models/Admin"));
dotenv_1.default.config();
console.log("✅ .env chargé avec succès :");
const router = express_1.default.Router();
const SECRET = process.env.JWT_SECRET || "super_secret_key";
/* ---------------------- 🔹 CRÉER L'ADMIN ---------------------- */
// 🔹 Créer l'admin automatiquement à partir du .env
router.post("/create-admin", async (req, res) => {
    try {
        const existingAdmin = await Admin_1.default.findOne({ email: process.env.ADMIN_EMAIL });
        if (existingAdmin) {
            return res.json({ message: "Admin déjà existant ✅" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(process.env.ADMIN_PASSWORD, 10);
        const admin = new Admin_1.default({
            name: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
        });
        await admin.save();
        res.json({ message: "Admin créé avec succès ✅", admin });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});
/* ---------------------- 🔹 LOGIN ADMIN ---------------------- */
router.post("/login-admin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin_1.default.findOne({ email });
        console.log("🔹 Requête reçue :", req.body);
        if (!admin)
            return res.status(400).json({ error: "Admin non trouvé" });
        const isMatch = await bcryptjs_1.default.compare(password, admin.password);
        if (!isMatch)
            return res.status(400).json({ error: "Mot de passe incorrect" });
        const token = jsonwebtoken_1.default.sign({ id: admin._id, email: admin.email, role: "admin" }, SECRET, { expiresIn: "3h" });
        res.json({ message: "Connexion admin réussie ✅", token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});
/* ---------------------- 🔹 LOGIN ÉTUDIANT ---------------------- */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await Student_1.default.findOne({ email });
        if (!student)
            return res.status(400).json({ error: "Étudiant non trouvé" });
        const isMatch = await bcryptjs_1.default.compare(password, student.password);
        if (!isMatch)
            return res.status(400).json({ error: "Mot de passe incorrect" });
        const token = jsonwebtoken_1.default.sign({ id: student._id, email: student.email, role: "student" }, SECRET, { expiresIn: "2h" });
        res.json({ message: "Connexion étudiant réussie ✅", token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});
/* ---------------------- 🔹 GESTION ÉTUDIANTS (ADMIN SEULEMENT) ---------------------- */
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ error: "Token manquant" });
    try {
        req.user = jsonwebtoken_1.default.verify(token, SECRET);
        next();
    }
    catch {
        res.status(403).json({ error: "Token invalide" });
    }
};
const verifyAdmin = (req, res, next) => {
    if (req.user.role === "admin")
        next();
    else
        res.status(403).json({ error: "Accès réservé à l'admin" });
};
router.post("/create-student", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await Student_1.default.findOne({ email });
        if (existing)
            return res.status(400).json({ error: "Email déjà utilisé" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const student = new Student_1.default({ name, email, password: hashedPassword });
        await student.save();
        res.json({ message: "Étudiant créé ✅" });
    }
    catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});
router.get("/students", verifyToken, verifyAdmin, async (req, res) => {
    const students = await Student_1.default.find({}, { password: 0 });
    res.json(students);
});
router.delete("/students/:id", verifyToken, verifyAdmin, async (req, res) => {
    await Student_1.default.findByIdAndDelete(req.params.id);
    res.json({ message: "Étudiant supprimé ✅" });
});
exports.default = router;
