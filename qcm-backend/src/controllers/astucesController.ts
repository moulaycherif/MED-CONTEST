import { Request, Response } from "express";
import Astuce from "../models/Astuce";

/* 🔵 ASTUCES PAR CHAPITRE (ÉTUDIANT) */
export const getAstucesByChapter = async (req: Request, res: Response) => {
  try {
    const { chapter } = req.params;

    const astuces = await Astuce.find({
      chapter: { $regex: chapter, $options: "i" }, // 🔥 match flexible
    }).sort({ order: 1 });

    console.log("🔎 Chapitre reçu :", chapter);
    console.log("📦 Astuces trouvées :", astuces.length);

    res.json(astuces);
  } catch (error) {
    console.error("Erreur getAstucesByChapter:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* 🟢 CRÉATION ASTUCE (ADMIN) */
export const createAstuce = async (req: Request, res: Response) => {
  try {
    const { subject, chapter, title, description, cases } = req.body;

    if (!subject || !chapter || !title) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    const astuce = new Astuce({
      subject,
      chapter,
      title,
      description,
      cases,
    });

    await astuce.save();

    res.status(201).json(astuce);
  } catch (error) {
    console.error("Erreur createAstuce:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
