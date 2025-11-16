import { Router } from "express";
import { getRanking } from "../controllers/rankingController";

const router = Router();

router.get("/:qcmId", getRanking);

export default router;
