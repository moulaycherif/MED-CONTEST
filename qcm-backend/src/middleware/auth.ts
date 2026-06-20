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
      // Si le Frontend tente de récupérer le profil étudiant en arrière-plan
      // On court-circuite la base de données et on renvoie un faux profil valide !
      if (req.originalUrl.includes("/me") || req.originalUrl.includes("/profile") || req.originalUrl.includes("/verify")) {
        return res.json({
          _id: "guest_id",
          name: "Mode Démo",
          email: "demo@med-contest.com",
          role: "guest",
        });
      }

      // Pour les autres requêtes (comme les QCM), on laisse passer
      req.student = { role: "guest" };
      return next();
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