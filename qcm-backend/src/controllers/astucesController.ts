import { Request, Response } from "express";
import Astuce from "../models/Astuce";

console.log("🔥 ASTUCES CONTROLLER:");

/**
 * Récupérer les astuces d'un chapitre
 */
export const getAstucesByChapter = async (req: Request, res: Response) => {
  try {
    const { chapter } = req.params;

    if (!chapter) {
      return res.status(400).json({ message: "Chapitre manquant" });
    }

    const astuces = await Astuce.find({ chapter });

    return res.json(astuces);
  } catch (error) {
    console.error("Erreur getAstucesByChapter:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Ajouter une astuce
 */
export const createAstuce = async (req: Request, res: Response) => {
  try {
    const { chapter, question, answer } = req.body;

    if (!chapter || !question || !answer) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    const newAstuce = new Astuce({
      chapter,
      question,
      answer,
    });

    await newAstuce.save();

    return res.status(201).json(newAstuce);
  } catch (error) {
    console.error("Erreur createAstuce:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
