// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Student from "../models/Student";

const SECRET = process.env.JWT_SECRET || "super_secret_key";



export const authenticateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: "Token manquant" });

  try {
    const decoded: any = jwt.verify(token, SECRET);
    const student = await Student.findById(decoded.id);
    if (!student) return res.status(401).json({ error: "Étudiant non trouvé" });

    req.student = student;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide" });
  }
};
