import { Request, Response } from "express";
import { getRankingByQcm } from "../services/rankingService";

console.log("🔥 RANKING CONTROLLER:");

export async function getRanking(req: Request, res: Response): Promise<void> {
  try {
    const { qcmId } = req.params;
    if (!qcmId) {
      res.status(400).json({ message: "qcmId manquant" });
      return;
    }

    const ranking = await getRankingByQcm(qcmId);
    res.json(ranking);
  } catch (error) {
    console.error("Erreur getRanking:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}
