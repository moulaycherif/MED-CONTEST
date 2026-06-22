// routes/statsRoutes.ts
import express from "express";
import {
  getStudentStats,
  getQcmStats,
  getActivityStats,
  getSuccessEvolution,
} from "../controllers/statsController";

// 🚨 MODIFIÉ : On importe aussi blockGuest
import { authenticateStudent, blockGuest } from "../middleware/authMiddleware"; 

const router = express.Router();

// 📊 Dashboard complet (🔒 Bloqués pour l'invité)
router.get("/student", authenticateStudent, blockGuest, getStudentStats);
router.get("/qcm", authenticateStudent, blockGuest, getQcmStats);
router.get("/activity", authenticateStudent, blockGuest, getActivityStats);
router.get("/success-evolution", authenticateStudent, blockGuest, getSuccessEvolution);

export default router;