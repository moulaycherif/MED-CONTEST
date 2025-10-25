// routes/authRoutes.ts
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Student from "../models/Student";
import Admin from "../models/Admin";

dotenv.config();

console.log("✅ .env chargé avec succès :");

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "super_secret_key";

/* ---------------------- 🔹 CRÉER L'ADMIN ---------------------- */
// 🔹 Créer l'admin automatiquement à partir du .env

router.post("/create-admin", async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (existingAdmin) {
      return res.json({ message: "Admin déjà existant ✅" });
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);

    const admin = new Admin({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
    });

    await admin.save();
    res.json({ message: "Admin créé avec succès ✅", admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


/* ---------------------- 🔹 LOGIN ADMIN ---------------------- */
router.post("/login-admin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    console.log("🔹 Requête reçue :", req.body);

    if (!admin) return res.status(400).json({ error: "Admin non trouvé" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign({ id: admin._id, email: admin.email, role: "admin" }, SECRET, { expiresIn: "3h" });

    res.json({ message: "Connexion admin réussie ✅", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ---------------------- 🔹 LOGIN ÉTUDIANT ---------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ error: "Étudiant non trouvé" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign({ id: student._id, email: student.email, role: "student" }, SECRET, { expiresIn: "2h" });

    res.json({ message: "Connexion étudiant réussie ✅", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ---------------------- 🔹 GESTION ÉTUDIANTS (ADMIN SEULEMENT) ---------------------- */
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manquant" });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).json({ error: "Token invalide" });
  }
};

const verifyAdmin = (req: any, res: any, next: any) => {
  if (req.user.role === "admin") next();
  else res.status(403).json({ error: "Accès réservé à l'admin" });
};

router.post("/create-student", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email déjà utilisé" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({ name, email, password: hashedPassword });
    await student.save();

    res.json({ message: "Étudiant créé ✅" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/students", verifyToken, verifyAdmin, async (req, res) => {
  const students = await Student.find({}, { password: 0 });
  res.json(students);
});

router.delete("/students/:id", verifyToken, verifyAdmin, async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Étudiant supprimé ✅" });
});

export default router;
