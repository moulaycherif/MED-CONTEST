import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Student from "../models/Student";

const SECRET = process.env.JWT_SECRET || "super_secret_key";

// Pour que TypeScript accepte req.student avec le rôle guest
declare global {
  namespace Express {
    interface Request {
      student?: any; 
    }
  }
}

export const authenticateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token manquant" });
    }

    // 🟢 NOUVEAU : Interception du token Invité
    if (token === "guest_token") {
      req.student = { role: "guest" }; // On crée un profil fictif côté serveur
      return next(); // On laisse passer vers le Controller
    }

    // --- Suite normale pour les vrais étudiants ---
    const decoded: any = jwt.verify(token, SECRET);
    const student = await Student.findById(decoded.id);

    if (!student) {
      return res.status(401).json({ error: "Étudiant non trouvé" });
    }

    // 🔥 ICI la clé
    req.student = student;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide" });
  }
};