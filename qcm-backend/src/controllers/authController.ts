import { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // 👈 Intégration de bcrypt pour les mots de passe hachés
import User from "../models/Student";
import Admin from "../models/Admin"; // 👈 Ajout de l'import pour le modèle Admin
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const JWT_SECRET = process.env.JWT_SECRET || "votre_secret_jwt_super_securise";

// ==========================================
// 🔹 PARTIE ÉTUDIANT
// ==========================================

// 🔹 Connexion de l'étudiant (Login avec Session Unique et Hachage Bcrypt)
export const loginStudent = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Trouver l'étudiant par email
    const student = await User.findOne({ email });
    if (!student) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // 2. 🔐 Sécurité : Vérification du mot de passe haché avec Bcrypt
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // 3. Sécurité : Générer un ID unique pour CETTE nouvelle session
    const newSessionId = crypto.randomUUID();
    const userIp = (req.headers["x-forwarded-for"] as string) || req.ip || "0.0.0.0";

    // 4. Écraser la session précédente en base (Déconnectera l'ancien poste)
    student.currentSessionId = newSessionId;
    student.currentIp = userIp;
    await student.save();

    // 5. Inclure le sessionId secret dans le token JWT
    const token = jwt.sign(
      { 
        userId: student._id, 
        sessionId: newSessionId,
        isAdmin: student.isAdmin 
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        isAdmin: student.isAdmin
      }
    });
  } catch (err) {
    console.error("❌ Erreur Login :", err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion" });
  }
};

// 🔹 Déconnexion de l'étudiant (Logout pour vider la session en base)
export const logoutStudent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth?.userId; 
    
    if (userId) {
      // On remet à null pour libérer le compte instantanément
      await User.findByIdAndUpdate(userId, {
        currentSessionId: null,
        currentIp: null
      });
    }

    res.json({ message: "Déconnexion réussie" });
  } catch (err) {
    console.error("❌ Erreur lors du logout :", err);
    res.status(500).json({ error: "Erreur serveur lors de la déconnexion" });
  }
};

// ==========================================
// 🔐 PARTIE ADMINISTRATEUR (Intégrée & Adaptée)
// ==========================================

// 🔹 Connexion de l'administrateur (Login avec Session Unique et Hachage Bcrypt)
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Trouver l'admin par email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // 2. 🔐 Sécurité : Vérification du mot de passe haché de l'admin
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // 3. Sécurité : Générer un ID unique pour CETTE nouvelle session admin
    const newSessionId = crypto.randomUUID();
    const userIp = (req.headers["x-forwarded-for"] as string) || req.ip || "0.0.0.0";

    // 4. Écraser la session précédente en base de données
    admin.currentSessionId = newSessionId;
    admin.currentIp = userIp;
    await admin.save();

    // 5. Signature du token contenant le userId et le sessionId unique de l'admin
    const token = jwt.sign(
      { 
        userId: admin._id, 
        sessionId: newSessionId,
        isAdmin: true 
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Connexion réussie (Admin)",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        isAdmin: true
      }
    });
  } catch (err) {
    console.error("❌ Erreur Login Admin :", err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion de l'admin" });
  }
};

// 🔹 Déconnexion de l'administrateur
export const logoutAdmin = async (req: Request, res: Response) => {
  try {
    // Si vous utilisez un type de requête personnalisé pour l'admin (ex: req.admin)
    const adminId = (req as any).admin?._id; 
    
    if (adminId) {
      await Admin.findByIdAndUpdate(adminId, {
        currentSessionId: null,
        currentIp: null
      });
    }

    res.json({ message: "Déconnexion Admin réussie" });
  } catch (err) {
    console.error("❌ Erreur lors du logout admin :", err);
    res.status(500).json({ error: "Erreur serveur lors de la déconnexion" });
  }
};

// ==========================================
// ⚙️ GESTION DU PANEL (Actions Admin sur Étudiants)
// ==========================================

// 🔹 Créer un étudiant (admin uniquement) - VERSION SÉCURISÉE AVEC HACHAGE
export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    // 1. Vérifier si l'étudiant existe déjà
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Cet email existe déjà" });

    // 2. 🔐 Sécurité : Hacher le mot de passe avant de l'envoyer à MongoDB
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Créer l'étudiant avec le mot de passe sécurisé
    const student = new User({ 
      name, 
      email, 
      password: hashedPassword, // 👈 On enregistre l'empreinte hachée
      isAdmin: false 
    });
    await student.save();

    // 4. Masquer le mot de passe haché de la réponse renvoyée à l'administrateur
    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.json({ message: "Étudiant créé avec succès", student: studentResponse });
  } catch (err) {
    console.error("❌ Erreur lors de la création de l'étudiant :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 🔹 Liste de tous les étudiants
export const getStudents = async (req: Request, res: Response) => {
  try {
    // Adaptation selon Student.ts (Filtre les non-admins)
    const students = await User.find({ isAdmin: false }).select("-password");
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 🔹 Supprimer un étudiant
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Étudiant supprimé" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};