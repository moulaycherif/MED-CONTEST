import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";

const SECRET = process.env.JWT_SECRET || "super_secret_key";

export interface AuthAdminRequest extends Request {
  admin?: any;
}

export const authenticateAdmin = async (
  req: AuthAdminRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manquant" });

  try {
    const decoded: any = jwt.verify(token, SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ error: "Admin non trouvé" });

    req.admin = admin;
    next();
  } catch (err) {
    console.error("❌ Erreur vérification token admin :", err);
    return res.status(401).json({ error: "Token invalide" });
  }
};
