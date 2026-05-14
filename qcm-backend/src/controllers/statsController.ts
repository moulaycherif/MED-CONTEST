import { Request, Response } from "express";
import mongoose from "mongoose";

import StudentActivity from "../models/StudentActivity";

// 📊 QCM PAR MATIÈRE
export const getQcmStats = async (
  req: Request,
  res: Response
) => {
  try {
    const student = new mongoose.Types.ObjectId(
      req.student!._id
    );

    const stats = await StudentActivity.aggregate([
      {
        $match: {
          student,
          type: "QCM",
        },
      },
      {
        $group: {
          _id: "$subject",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    console.error("❌ getQcmStats :", error);

    res.status(500).json({
      message: "Erreur récupération statistiques QCM",
    });
  }
};

// 📈 ACTIVITÉ DANS LE TEMPS
export const getActivityStats = async (
  req: Request,
  res: Response
) => {
  try {
    const student = new mongoose.Types.ObjectId(
      req.student!._id
    );

    const stats = await StudentActivity.aggregate([
      {
        $match: {
          student,
        },
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
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    console.error("❌ getActivityStats :", error);

    res.status(500).json({
      message: "Erreur récupération activité",
    });
  }
};

// 🧠 DASHBOARD COMPLET
export const getStudentStats = async (
  req: Request,
  res: Response
) => {
  try {
    const student = new mongoose.Types.ObjectId(
      req.student!._id
    );

    // 📊 QCM par matière
    const qcmBySubject = await StudentActivity.aggregate([
      {
        $match: {
          student,
          type: "QCM",
        },
      },
      {
        $group: {
          _id: "$subject",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // 📈 Activité dans le temps
    const timeline = await StudentActivity.aggregate([
      {
        $match: {
          student,
        },
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
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    // 📚 Ressources consultées
    const resources = await StudentActivity.aggregate([
      {
        $match: {
          student,
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    // 🏆 Classement étudiant
    const ranking = await StudentActivity.aggregate([
      {
        $match: {
          type: "QCM",
        },
      },
      {
        $group: {
          _id: "$student",
          total: { $sum: 1 },
        },
      },
      {
        $sort: {
          total: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    // 📈 Évolution des réussites
    const successEvolution =
      await StudentActivity.aggregate([
        {
          $match: {
            student,
            type: {
              $in: ["QCM", "EXERCISE"],
            },
          },
        },
        {
          $group: {
            _id: {
              subject: "$subject",
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
            },
            avgSuccess: {
              $avg: "$successRate",
            },
          },
        },
        {
          $sort: {
            "_id.date": 1,
          },
        },
      ]);

    res.json({
      qcmBySubject,
      timeline,
      resources,
      ranking,
      successEvolution,
    });
  } catch (error) {
    console.error("❌ getStudentStats :", error);

    res.status(500).json({
      message:
        "Erreur récupération statistiques étudiant",
    });
  }
};

// 📈 ROUTE DÉDIÉE ÉVOLUTION DES RÉSULTATS
export const getSuccessEvolution = async (
  req: Request,
  res: Response
) => {
  try {
    const student = new mongoose.Types.ObjectId(
      req.student!._id
    );

    const stats = await StudentActivity.aggregate([
      {
        $match: {
          student,
          type: {
            $in: ["QCM", "EXERCISE"],
          },
        },
      },
      {
        $group: {
          _id: {
            subject: "$subject",
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
          },
          avgSuccess: {
            $avg: "$successRate",
          },
        },
      },
      {
        $sort: {
          "_id.date": 1,
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    console.error(
      "❌ getSuccessEvolution :",
      error
    );

    res.status(500).json({
      message:
        "Erreur récupération évolution réussite",
    });
  }
};