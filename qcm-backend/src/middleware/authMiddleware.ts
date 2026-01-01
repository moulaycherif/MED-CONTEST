import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Student, { IStudent } from "../models/Student";

const SECRET = process.env.JWT_SECRET || "super_secret_key";

export interface AuthPayload {
  id: string;
  role: "student" | "admin";
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
    const decoded = jwt.verify(token, SECRET) as AuthPayload;

    req.auth = decoded;   // 🔥 rôle et id viennent du JWT

    const student = await Student.findById(decoded.id);
    if (!student) {
      return res.status(401).json({ error: "Étudiant non trouvé" });
    }

    req.student = student;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide" });
  }
};
