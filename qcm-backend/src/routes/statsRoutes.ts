import express from "express";
import {
  getStudentStats,
  getStudentTimeline
} from "../controllers/statsController";

const router = express.Router();

router.get("/student/:id/timeline", getStudentTimeline);
router.get("/student/:id", getStudentStats);

export default router;
