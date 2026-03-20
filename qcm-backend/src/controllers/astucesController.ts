import { Request, Response } from "express";
import Astuce from "../models/Astuce";
import pdf from "pdf-parse";

/* 🔵 ASTUCES PAR CHAPITRE (ÉTUDIANT) */
export const getAstucesByChapter = async (req: Request, res: Response) => {
  try {
    const { chapter } = req.params;

    const astuces = await Astuce.find({
      chapter: { $regex: chapter, $options: "i" }, // 🔥 match flexible
    }).sort({ order: 1 });

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

export const parsePdfToCases = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Fichier manquant" });
    }

    const data = await pdf(req.file.buffer);

    const text = data.text;

    console.log("📄 PDF texte brut :", text);

    // 🔥 Nettoyage
    const cleanText = text
      .replace(/\r\n/g, "\n")
      .replace(/\s+/g, " ")
      .replace(/e\s*ˊ/g, "é");

    // 🔥 Découpage en cas
    const blocks = cleanText.split(/Cas\s*\d+/i);

    const cases = blocks
      .filter((b) => b.trim().length > 30)
      .map((b, i) => ({
        title: `Cas ${i + 1}`,
        content: b.trim(),
      }));

    res.json({ cases });

  } catch (err) {
    console.error("❌ Erreur PDF :", err);
    res.status(500).json({ message: "Erreur parsing PDF" });
  }
};
