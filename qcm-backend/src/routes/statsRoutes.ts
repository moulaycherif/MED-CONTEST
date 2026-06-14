import express from "express";
import {
  getStudentStats,
  getQcmStats,
  getActivityStats,
  getSuccessEvolution,
} from "../controllers/statsController";

// ✅ Utilisez le middleware mis à jour avec la vérification de session unique
import { authenticateStudent } from "../middleware/authMiddleware"; 

const router = express.Router();

// 📊 Dashboard complet
router.get(
  "/student",
  authenticateStudent,
  getStudentStats
);

// 📚 QCM par matière
router.get(
  "/qcm",
  authenticateStudent,
  getQcmStats
);

// 📈 Activité dans le temps
router.get(
  "/activity",
  authenticateStudent,
  getActivityStats
);

router.get(
  "/success-evolution",
  authenticateStudent,
  getSuccessEvolution
);

export default router;