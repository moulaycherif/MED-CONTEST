import { Request, Response } from "express";
import StudentActivity from "../models/StudentActivity";

/* ============================
   📈 TIMELINE (activité / jour)
============================ */
const getTimeline = async (studentId: string) => {
  return StudentActivity.aggregate([
    { $match: { studentId } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

/* ============================
   📊 QCM PAR MATIÈRE
============================ */
const getQcmBySubject = async (studentId: string) => {
  return StudentActivity.aggregate([
    { $match: { studentId, type: "QCM" } },
    {
      $group: {
        _id: "$subject",
        count: { $sum: 1 }
      }
    }
  ]);
};

/* ============================
   🏆 CLASSEMENT ÉTUDIANTS
============================ */
const getRanking = async () => {
  return StudentActivity.aggregate([
    { $match: { type: "QCM" } },
    {
      $group: {
        _id: "$studentId",
        total: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } },
    { $limit: 10 }
  ]);
};

/* ============================
   📊 STATS ÉTUDIANT (GLOBAL)
============================ */
export const getStudentStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [timeline, qcmBySubject, ranking, resources] = await Promise.all([
      getTimeline(id),
      getQcmBySubject(id),
      getRanking(),
      StudentActivity.aggregate([
        { $match: { studentId: id } },
        { $group: { _id: "$type", count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      timeline,
      qcmBySubject,
      ranking,
      resources
    });
  } catch (err) {
    console.error("❌ getStudentStats", err);
    res.status(500).json({ message: "Erreur stats étudiant" });
  }
};
