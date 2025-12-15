import { Response } from "express";
import StudentActivity from "../models/StudentActivity";
import { AuthRequest } from "../middleware/auth";

/**
 * 📊 Timeline activité étudiant (par jour)
 * Route : GET /api/stats/student/me/timeline
 */
export const getStudentTimeline = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    const timeline = await StudentActivity.aggregate([
      { $match: { studentId } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
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

/**
 * 📊 Stats globales étudiant
 * Route : GET /api/stats/student/me
 */
export const getStudentStats = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    // 📄 Activité de l’étudiant (par type)
    const studentByType = await StudentActivity.aggregate([
      { $match: { studentId } },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    // 🔢 Total QCM étudiant
    const studentQcmTotal =
      studentByType.find((t) => t._id === "QCM")?.count || 0;

    // 📊 Moyenne QCM de tous les étudiants
    const avg = await StudentActivity.aggregate([
      { $match: { type: "QCM" } },
      { $group: { _id: "$studentId", total: { $sum: 1 } } },
      { $group: { _id: null, average: { $avg: "$total" } } }
    ]);

    const averageQcm = avg[0]?.average || 0;

    // 🎯 Concours (placeholder)
    const concours = { done: 0, total: 0 };

    res.json({
      concours,
      resources: studentByType,
      comparison: {
        student: studentQcmTotal,
        average: averageQcm
      }
    });
  } catch (err) {
    console.error("❌ getStudentStats", err);
    res.status(500).json({ message: "Erreur stats étudiant" });
  }
};
