import { Request, Response } from "express";
import StudentActivity from "../models/StudentActivity";

export const createStudentActivity = async (
  req: Request,
  res: Response
) => {
  try {
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
    res.status(500).json({
      message: "Erreur création activité",
    });
  }
};