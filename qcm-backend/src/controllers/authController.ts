import { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; 
import User from "../models/Student";
import Admin from "../models/Admin"; 
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const JWT_SECRET = process.env.JWT_SECRET || "votre_secret_jwt_super_securise";

// ==========================================
// 🔹 PARTIE ÉTUDIANT
// ==========================================

export const loginStudent = async (req: Request, res: Response) => {
  try {
    // 👉 On ajoute "force" que le frontend pourra nous envoyer
    const { email, password, force } = req.body; 

    const student = await User.findOne({ email });
    if (!student) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // 🚨 NOUVEAU : Gestion du bouton "Forcer la connexion"
    // Si une session existe ET que l'utilisateur n'a pas demandé à forcer...
    if (student.currentSessionId && !force) {
      // On renvoie une erreur spéciale (409 Conflict) pour déclencher le bouton sur React
      return res.status(409).json({ 
        code: "SESSION_ACTIVE",
        error: "Ce compte est déjà connecté sur un autre appareil." 
      });
    }

    // ✅ Si on arrive ici, c'est soit qu'il n'y avait pas de session, 
    // soit que l'étudiant a cliqué sur "Forcer". On écrase donc l'ancienne !
    const newSessionId = crypto.randomUUID();
    const userIp = (req.headers["x-forwarded-for"] as string) || req.ip || "0.0.0.0";

    student.currentSessionId = newSessionId;
    student.currentIp = userIp;
    await student.save();

    const token = jwt.sign(
      { userId: student._id, sessionId: newSessionId, isAdmin: student.isAdmin },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      student: { id: student._id, name: student.name, email: student.email, isAdmin: student.isAdmin }
    });
  } catch (err) {
    console.error("❌ Erreur Login :", err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion" });
  }
};

export const logoutStudent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth?.userId; 
    
    if (userId) {
      // On remet à null pour libérer le compte instantanément et autoriser une nouvelle connexion
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
// 🔐 PARTIE ADMINISTRATEUR
// ==========================================

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // 🚨 VERROUILLAGE STRICT ADMIN 🚨
    if (admin.currentSessionId) {
      return res.status(403).json({ 
        error: "Un administrateur est déjà connecté. Déconnexion préalable requise." 
      });
    }

    const newSessionId = crypto.randomUUID();
    const userIp = (req.headers["x-forwarded-for"] as string) || req.ip || "0.0.0.0";

    admin.currentSessionId = newSessionId;
    admin.currentIp = userIp;
    await admin.save();

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

export const logoutAdmin = async (req: Request, res: Response) => {
  try {
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
// ⚙️ GESTION DU PANEL
// ==========================================

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Cet email existe déjà" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      isAdmin: false 
    });
    await student.save();

    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.json({ message: "Étudiant créé avec succès", student: studentResponse });
  } catch (err) {
    console.error("❌ Erreur lors de la création de l'étudiant :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await User.find({ isAdmin: false }).select("-password");
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Étudiant supprimé" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};