import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../models/Admin";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { authenticateStudent } from "../middleware/authMiddleware";

// Importations des fonctions centralisées de votre contrôleur
import { 
  loginStudent, 
  logoutStudent, 
  createStudent, 
  getStudents, 
  deleteStudent 
} from "../controllers/authController";

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "votre_secret_jwt_super_securise";

// ==========================================
// 🔑 ROUTES ADMINISTRATEUR (ADMIN)
// ==========================================

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

    // Payload de l'admin (ajusté selon vos besoins d'origine)
    const token = jwt.sign({ id: admin._id, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ 
      message: "Connexion admin ✅", 
      token, 
      admin: { id: admin._id, name: admin.name, email: admin.email } 
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ==========================================
// 🎓 ROUTES ÉTUDIANTS (STUDENT) & SESSION UNIQUE
// ==========================================

// 🔹 Login étudiant (Utilise la logique sécurisée de authController)
router.post("/login", loginStudent);

// 🔒 Logout étudiant : Libère instantanément la session unique dans MongoDB
router.post("/logout", authenticateStudent, logoutStudent);

// 🔹 Gestion des étudiants (Exemple d'intégration si non-déclarés ailleurs)
// Ces routes sont protégées : l'étudiant doit avoir un token valide ET être sur le bon poste
router.get("/students", authenticateStudent, getStudents);
router.post("/students", authenticateStudent, createStudent);
router.delete("/students/:id", authenticateStudent, deleteStudent);

export default router;