// controllers/studentActivityController.ts
import { Response } from "express";
import StudentActivity from "../models/StudentActivity";
// 🚨 NOUVEAU
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export const createStudentActivity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 🛡️ SÉCURITÉ DE LA BASE DE DONNÉES : On n'enregistre rien pour l'invité
    if (req.student?.role === "guest") {
      return res.status(201).json({ message: "Activité simulée avec succès en mode Démo ✅" });
    }

    const {
      type,
      subject,
      chapter,
      referenceId,
      score,
      totalQuestions,
      successRate,
      duration,
      examId,
    } = req.body;

    const activity = await StudentActivity.create({
      student: req.student!._id,
      type,
      subject,
      chapter,
      referenceId,
      score,
      totalQuestions,
      successRate,
      duration,
      examId,
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error("❌ createStudentActivity:", error);
    res.status(500).json({ message: "Erreur création activité" });
  }
};