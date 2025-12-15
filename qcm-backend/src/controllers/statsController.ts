import { Request, Response } from "express";
import StudentActivity from "../models/StudentActivity";

// 📊 Timeline activité étudiant
export const getStudentTimeline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const timeline = await StudentActivity.aggregate([
      { $match: { studentId: id } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $ifNull: ["$createdAt", new Date()] }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(timeline);
  } catch (err) {
    console.error("❌ getStudentTimeline", err);
    res.status(500).json({ message: "Erreur stats timeline" });
  }
};

// 📊 Stats globales étudiant
export const getStudentStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Ressources consultées
    const resources = await StudentActivity.aggregate([
      { $match: { studentId: id } },
      {
        $group: {
          _id: { $ifNull: ["$type", "UNKNOWN"] },
          count: { $sum: 1 }
        }
      }
    ]);

    // (placeholder concours pour l’instant)
    const concours = {
      done: 0,
      total: 0
    };

    res.json({
      concours,
      resources
    });
  } catch (err) {
    console.error("❌ getStudentStats", err);
    res.status(500).json({ message: "Erreur stats étudiant" });
  }
};
