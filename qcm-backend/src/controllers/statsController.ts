import { Response } from "express";
import StudentActivity from "../models/StudentActivity";
import { AuthRequest } from "../middleware/auth";

// 📊 STATS COMPLETES ÉTUDIANT (JWT)
export const getStudentStats = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    // 📈 Timeline activité
    const timeline = await StudentActivity.aggregate([
      { $match: { studentId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 📊 QCM par matière
    const qcmBySubject = await StudentActivity.aggregate([
      { $match: { studentId, type: "QCM" } },
      { $group: { _id: "$subject", count: { $sum: 1 } } }
    ]);

    // 📄 Ressources (Résumé / Astuce)
    const resources = await StudentActivity.aggregate([
      { $match: { studentId } },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    // 🏆 Classement étudiant (ranking)
    const ranking = await StudentActivity.aggregate([
      { $match: { type: "QCM" } },
      { $group: { _id: "$studentId", total: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    res.json({
      timeline,
      qcmBySubject,
      resources,
      ranking
    });
  } catch (err) {
    console.error("❌ stats étudiant", err);
    res.status(500).json({ message: "Erreur stats étudiant" });
  }
};

// 📊 Timeline seule (optionnel)
export const getStudentTimeline = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    const timeline = await StudentActivity.aggregate([
      { $match: { studentId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
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
