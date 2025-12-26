import express from "express";
import { getQcmStats, getActivityStats } from "../controllers/statsController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.get("/qcm", protect, getQcmStats);
router.get("/activity", protect, getActivityStats);

export default router;
