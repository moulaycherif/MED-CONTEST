import express from "express";
import { getStudentStats, getQcmStats, getActivityStats } from "../controllers/statsController";
import { authenticateStudent } from "../middleware/auth";

const router = express.Router();

router.get("/student", authenticateStudent, getStudentStats);
router.get("/qcm", authenticateStudent, getQcmStats);
router.get("/activity", authenticateStudent, getActivityStats);


export default router;
