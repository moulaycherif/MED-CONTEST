import { Response } from "express";
import StudentActivity from "../models/StudentActivity";
import { AuthRequest } from "../middleware/auth";

// 📊 QCM par matière
export const getQcmStats = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id; // JWT réel

    const stats = await StudentActivity.aggregate([
      {
        $match: {
          studentId,
          type: "QCM",
        },
      },
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
export const getActivityStats = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    const stats = await StudentActivity.aggregate([
      {
        $match: { studentId },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
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
