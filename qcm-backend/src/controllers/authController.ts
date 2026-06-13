import { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // 👈 Intégration de bcrypt pour les mots de passe hachés
import User from "../models/Student";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const JWT_SECRET = process.env.JWT_SECRET || "votre_secret_jwt_super_securise";

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

// 🔹 Déconnexion (Logout pour vider la session en base)
export const logoutStudent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // req.auth.userId est injecté automatiquement par le middleware authenticateStudent
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