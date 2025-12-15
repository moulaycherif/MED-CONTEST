import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import StudentActivity from "../models/StudentActivity";
import QCM from "../models/Question"; // ou Question selon ton modèle

export const submitQcm = async (req: AuthRequest, res: Response) => {
  try {
    const { qcmId } = req.body;

    const qcm = await QCM.findById(qcmId);
    if (!qcm) {
      return res.status(404).json({ message: "QCM introuvable" });
    }

    // ✅ ENREGISTREMENT DE L’ACTIVITÉ
    await StudentActivity.create({
      studentId: req.user!.id,
      type: "QCM",
      subject: qcm.subject,
      chapter: qcm.chapter,
      referenceId: qcm._id.toString()
    });

    res.json({ message: "QCM soumis avec succès" });
  } catch (err) {
    console.error("❌ submitQcm", err);
    res.status(500).json({ message: "Erreur soumission QCM" });
  }
};
