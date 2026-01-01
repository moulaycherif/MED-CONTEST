import { Request, Response } from "express";
import StudentActivity from "../models/StudentActivity";
import mongoose from "mongoose";

// 📊 QCM par matière
export const getQcmStats = async (req: Request, res: Response) => {
  try {
    const studentId =  req.student!._id.toString();

    const stats = await StudentActivity.aggregate([
      { $match: { studentId, type: "QCM" } },
      {
        $group: {
          _id: "$subject",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(stats);
  } catch (e) {
    console.error("❌ getQcmStats:", e);
    res.status(500).json({ message: "Erreur stats QCM" });
  }
};

// 📈 Activité dans le temps
export const getActivityStats = async (req: Request, res: Response) => {
  try {
    const studentId =  req.student!._id.toString();

    const stats = await StudentActivity.aggregate([
      { $match: { studentId } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(stats);
  } catch (e) {
    console.error("❌ getActivityStats:", e);
    res.status(500).json({ message: "Erreur stats activité" });
  }
};

// 🧠 STATS COMPLETES (utilisées par le dashboard)
export const getStudentStats = async (req: Request, res: Response) => {
  try {
    const studentId = req.student!._id.toString();

    const qcmBySubject = await StudentActivity.aggregate([
      { $match: { studentId, type: "QCM" } },
      { $group: { _id: "$subject", count: { $sum: 1 } } },
    ]);

    const timeline = await StudentActivity.aggregate([
      { $match: { studentId } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const resources = await StudentActivity.aggregate([
      { $match: { studentId } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    const ranking = await StudentActivity.aggregate([
      { $match: { type: "QCM" } },
      { $group: { _id: "$studentId", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    res.json({ qcmBySubject, timeline, resources, ranking });
  } catch (e) {
    console.error("❌ getStudentStats:", e);
    res.status(500).json({ message: "Erreur stats étudiant" });
  }
};