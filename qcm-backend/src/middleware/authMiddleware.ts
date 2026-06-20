import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Student, { IStudent } from "../models/Student";

const SECRET = process.env.JWT_SECRET || "votre_secret_jwt_super_securise";

// Même structure que le payload signé dans loginStudent
export interface AuthPayload {
  userId: string;
  sessionId: string;
  isAdmin: boolean;
}

export interface AuthenticatedRequest extends Request {
  student?: any; // Changé en any pour accepter le faux profil invité
  auth?: AuthPayload;
}

export const authenticateStudent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  // 🟢 NOUVEAU : Interception du token Invité dans le VRAI middleware
  if (token === "guest_token") {
    req.student = { 
      _id: "000000000000000000000000", // Faux ID parfait pour MongoDB
      role: "guest",
      name: "Mode Démo",
      email: "demo@med-contest.com",
      isActive: true,
    };

    // On intercepte les requêtes de vérification de profil
    const url = req.originalUrl.toLowerCase();
    if (url.includes("/me") || url.includes("/profile") || url.includes("/verify")) {
      return res.status(200).json(req.student);
    }

    return next();
  }

  try {
    // 1. Décoder et vérifier le token JWT
    const decoded = jwt.verify(token, SECRET) as AuthPayload;
    req.auth = decoded; 

    // 2. Chercher l'étudiant en base de données
    const student = await Student.findById(decoded.userId);
    if (!student) {
      return res.status(401).json({ error: "Étudiant non trouvé" });
    }

    // 🛑 3. SÉCURITÉ POSTE UNIQUE : Comparaison des sessions
    if (student.currentSessionId !== decoded.sessionId) {
      return res.status(403).json({ 
        code: "SESSION_KICKED", 
        error: "Votre compte est connecté sur un autre poste informatique." 
      });
    }

    req.student = student;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide" });
  }
};