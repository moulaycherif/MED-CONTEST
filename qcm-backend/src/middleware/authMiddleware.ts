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
  student?: IStudent;
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
    // Si l'ID de session du token n'est pas identique à celui stocké en base,
    // cela signifie que cet étudiant s'est connecté sur un autre ordinateur/navigateur.
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