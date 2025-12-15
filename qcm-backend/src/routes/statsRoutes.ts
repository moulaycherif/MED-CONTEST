import express from "express";
import { authMiddleware } from "../middleware/auth";
import {
  getStudentStats,
  getStudentTimeline
} from "../controllers/statsController";

const router = express.Router();

router.get("/student/me", authMiddleware, getStudentStats);
router.get("/student/me/timeline", authMiddleware, getStudentTimeline);

export default router;
