import { Request, Response } from "express";
import Astuce from "../models/Astuce";

export async function getAstucesByChapitre(req : Request, res : Response) {
  try {
    const chapitreName = req.params.chapitre;
    const astuces = await Astuce.find({ chapitre: chapitreName });
    res.json(astuces);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}
