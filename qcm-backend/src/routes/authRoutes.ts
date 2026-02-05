import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Student from "../models/Student";
import Admin from "../models/Admin";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { authenticateStudent, AuthenticatedRequest } from "../middleware/authMiddleware";

dotenv.config();
const router = express.Router();
const SECRET = process.env.JWT_SECRET || "super_secret_key";

// 🔹 Créer admin (initialisation)
router.post("/create-admin", async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (existingAdmin) return res.json({ message: "Admin déjà existant ✅" });

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);
    const admin = new Admin({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });
    await admin.save();
    res.json({ message: "Admin créé ✅", admin });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Login admin
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ error: "Admin introuvable" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, SECRET, { expiresIn: "7d" });
    res.json({ message: "Connexion admin ✅", token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Login étudiant
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ error: "Étudiant non trouvé" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign({ id: student._id, email: student.email, role: "student" }, SECRET, { expiresIn: "2h" });
    res.json({ message: "Connexion étudiant ✅", token });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;