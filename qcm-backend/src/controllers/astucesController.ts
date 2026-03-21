import Astuce from "../models/Astuce";
import { Request, Response } from "express";

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
    console.log("BODY :", req.body);

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


const pdfParse = require("pdf-parse"); // ✅ FIX

export const uploadAstucePdf = async (req: Request, res: Response) => {
  try {
    console.log("📥 Route upload PDF appelée");

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    console.log("FILE :", req.file);

    const data = await pdfParse(req.file.buffer); // ✅ fonctionne maintenant

    const text = data.text;
    console.log("📄 TEXTE PDF :", text);

    // 🔥 découpage en cas
    const blocks = text.split(/Cas\s*\d+/i);

    const cases = blocks
      .filter((b: string) => b.trim().length > 20)
      .map((b: string, i: number) => ({
        title: `Cas ${i + 1}`,
        content: b.trim(),
      }));

    return res.json({ cases });

  } catch (error) {
    console.error("❌ Erreur PDF:", error);
    return res.status(500).json({ message: "Erreur parsing PDF" });
  }
};

// helper interne
const parsePdfToCases = (text: string) => {
  const blocks = text.split(/Cas\s*\d+/i);

  return blocks
    .filter((b) => b.trim().length > 20)
    .map((b, i) => ({
      title: `Cas ${i + 1}`,
      content: b.trim(),
    }));
};
