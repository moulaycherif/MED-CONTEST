import { Router } from "express";
import { getStudentStats, getStudentTimeline } from "../controllers/statsController";
import { protect } from "../middleware/auth";

const router = Router();

// ✅ Statistiques complètes étudiant — JWT réel
router.get("/student", protect, getStudentStats);

// ✅ Timeline seule (optionnel)
router.get("/student/timeline", protect, getStudentTimeline);

export default router;
