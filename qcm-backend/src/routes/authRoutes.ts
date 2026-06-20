import express from "express";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "../models/Admin";

// 👇 Ajoutez ces DEUX lignes ici pour faire disparaître les erreurs :
import jwt from "jsonwebtoken";
import Student from "../models/Student";

// 🛡️ Vos middlewares de sécurité
import { authenticateAdmin } from "../middleware/authAdmin"; // 👈 Utilisation de votre middleware admin mis à jour
import { authenticateStudent } from "../middleware/authMiddleware";

// 📦 Importation de TOUTES les fonctions centralisées et sécurisées du contrôleur
import { 
  loginStudent, 
  logoutStudent, 
  loginAdmin,   // 👈 Ajouté pour la session unique Admin
  logoutAdmin,  // 👈 Ajouté pour libérer la session unique Admin
  createStudent, 
  getStudents, 
  deleteStudent 
} from "../controllers/authController";

dotenv.config();
const router = express.Router();

// ==========================================
// 🔑 ROUTES ADMINISTRATEUR (ADMIN)
// ==========================================

// 🔹 Créer admin (initialisation automatique via variables d'environnement)
router.post("/create-admin", async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (existingAdmin) return res.json({ message: "Admin déjà existant ✅" });

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);
    const admin = new Admin({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      currentSessionId: null, // Initialisé proprement
      currentIp: null
    });
    await admin.save();
    res.json({ message: "Admin créé ✅", admin });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur lors de la création initiale de l'admin" });
  }
});

// 🔹 Login admin (Utilise désormais la logique sécurisée à session unique de authController)
router.post("/admin/login", loginAdmin);

// 🔒 Logout admin : Libère instantanément la session unique admin dans MongoDB
router.post("/admin/logout", authenticateAdmin, logoutAdmin);


// ==========================================
// 🎓 ROUTES ÉTUDIANTS (STUDENT) & PANEL ADMIN
// ==========================================

// 🔹 Login étudiant (Utilise la logique sécurisée de authController)
router.post("/login", loginStudent);

// 🔒 Logout étudiant : Libère instantanément la session unique dans MongoDB
router.post("/logout", authenticateStudent, logoutStudent);

// 🛠️ Gestion des étudiants par l'administrateur
// ⚠️ Correction : Ces routes utilisent 'authenticateAdmin' car seul l'admin doit gérer les comptes !
router.get("/students", authenticateAdmin, getStudents);
router.post("/students", authenticateAdmin, createStudent);
router.delete("/students/:id", authenticateAdmin, deleteStudent);

// 📁 À ajouter dans authRoutes.ts

// Route universelle pour vérifier l'identité et la validité de la session en cours
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Non authentifié" });

  try {
    // On décode le token pour savoir à qui on a affaire
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "votre_secret_jwt_super_securise") as any;
    
    if (decoded.isAdmin) {
      // Vérification côté Admin
      const admin = await Admin.findById(decoded.userId);
      if (!admin || admin.currentSessionId !== decoded.sessionId) {
        return res.status(403).json({ code: "SESSION_KICKED", error: "Session admin invalide" });
      }
      return res.json({ id: admin._id, name: admin.name, email: admin.email, isAdmin: true });
    } else {
      // Vérification côté Étudiant
      const student = await Student.findById(decoded.userId);
      if (!student || student.currentSessionId !== decoded.sessionId) {
        return res.status(403).json({ code: "SESSION_KICKED", error: "Session étudiante invalide" });
      }
      return res.json({ id: student._id, name: student.name, email: student.email, isAdmin: false });
    }
  } catch (err) {
    return res.status(401).json({ error: "Session expirée ou invalide" });
  }
});

export default router;