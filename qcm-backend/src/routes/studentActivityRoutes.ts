import express from "express";
import { authenticateStudent } from "../middleware/auth";
import { createStudentActivity } from "../controllers/studentActivityController";

const router = express.Router();

router.post("/", authenticateStudent, createStudentActivity);

export default router;