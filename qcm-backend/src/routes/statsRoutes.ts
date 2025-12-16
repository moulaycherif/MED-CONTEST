import express from "express";
import { getStudentStats } from "../controllers/statsController";

const router = express.Router();

router.get("/student/:id", getStudentStats);

export default router;
