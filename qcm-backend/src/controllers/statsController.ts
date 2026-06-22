// controllers/statsController.ts
import { Response } from "express";
import mongoose from "mongoose";
import StudentActivity from "../models/StudentActivity";
// 🚨 NOUVEAU
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// 📊 QCM PAR MATIÈRE
export const getQcmStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.student?.role === "guest") return res.json([]); // Garde-fou démo

    const student = new mongoose.Types.ObjectId(req.student!._id);
    const stats = await StudentActivity.aggregate([
      { $match: { student, type: "QCM" } },
      { $group: { _id: "$subject", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(stats);
  } catch (error) {
    console.error("❌ getQcmStats :", error);
    res.status(500).json({ message: "Erreur récupération statistiques QCM" });
  }
};

// 📈 ACTIVITÉ DANS LE TEMPS
export const getActivityStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.student?.role === "guest") return res.json([]); // Garde-fou démo

    const student = new mongoose.Types.ObjectId(req.student!._id);
    const stats = await StudentActivity.aggregate([
      { $match: { student } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(stats);
  } catch (error) {
    console.error("❌ getActivityStats :", error);
    res.status(500).json({ message: "Erreur récupération activité" });
  }
};

// 🧠 DASHBOARD COMPLET
export const getStudentStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 🛡️ Si c'est un invité, on renvoie une structure vide pour éviter de faire planter le front
    if (req.student?.role === "guest") {
      return res.json({
        qcmBySubject: [],
        timeline: [],
        resources: [],
        ranking: [],
        successEvolution: [],
      });
    }

    const student = new mongoose.Types.ObjectId(req.student!._id);

    const qcmBySubject = await StudentActivity.aggregate([
      { $match: { student, type: "QCM" } },
      { $group: { _id: "$subject", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const timeline = await StudentActivity.aggregate([
      { $match: { student } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const resources = await StudentActivity.aggregate([
      { $match: { student } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    const ranking = await StudentActivity.aggregate([
      { $match: { type: "QCM" } },
      { $group: { _id: "$student", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    const successEvolution = await StudentActivity.aggregate([
      { $match: { student, type: { $in: ["QCM", "EXERCISE"] } } },
      { $group: { _id: { subject: "$subject", date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } }, avgSuccess: { $avg: "$successRate" } } },
      { $sort: { "_id.date": 1 } },
    ]);

    res.json({ qcmBySubject, timeline, resources, ranking, successEvolution });
  } catch (error) {
    console.error("❌ getStudentStats :", error);
    res.status(500).json({ message: "Erreur récupération statistiques étudiant" });
  }
};

// 📈 ROUTE DÉDIÉE ÉVOLUTION DES RÉSULTATS
export const getSuccessEvolution = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.student?.role === "guest") return res.json([]); // Garde-fou démo

    const student = new mongoose.Types.ObjectId(req.student!._id);
    const stats = await StudentActivity.aggregate([
      { $match: { student, type: { $in: ["QCM", "EXERCISE"] } } },
      { $group: { _id: { subject: "$subject", date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } }, avgSuccess: { $avg: "$successRate" } } },
      { $sort: { "_id.date": 1 } },
    ]);
    res.json(stats);
  } catch (error) {
    console.error("❌ getSuccessEvolution :", error);
    res.status(500).json({ message: "Erreur récupération évolution réussite" });
  }
};