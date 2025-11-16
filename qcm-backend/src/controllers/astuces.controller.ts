import { Request, Response } from "express";
import Astuce from "../models/Astuce";

export const getAstucesByChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chapter } = req.params;

    if (!chapter) {
      res.status(400).json({ message: "Chapitre manquant" });
      return;
    }

    const astuces = await Astuce.find({ chapter });
    res.json(astuces);
  } catch (error) {
    console.error("Erreur getAstucesByChapter:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const createAstuce = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chapter, question, answer } = req.body;

    if (!chapter || !question || !answer) {
      res.status(400).json({ message: "Champs manquants" });
      return;
    }

    const newAstuce = new Astuce({
      chapter,
      question,
      answer,
    });

    await newAstuce.save();
    res.status(201).json(newAstuce);
  } catch (error) {
    console.error("Erreur createAstuce:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
