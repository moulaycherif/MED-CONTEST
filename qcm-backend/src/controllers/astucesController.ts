import Astuce from "../models/Astuce";
import { Request, Response } from "express";
import { supabase } from "../config/supabase";

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

/* 🟢 UPLOAD ASTUCE (ADMIN) */
export const uploadAstucePdf = async (req: Request, res: Response) => {
  try {
    console.log("📥 Upload PDF Supabase");

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier" });
    }

    const file = req.file;

    const fileName = `pdfs/${Date.now()}-${file.originalname}`;

    const { error } = await supabase.storage
      .from("astuces") // ⚠️ bucket
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({ message: "Erreur upload Supabase" });
    }

    const { data } = supabase.storage
      .from("astuces")
      .getPublicUrl(fileName);

    console.log("✅ URL PDF :", data.publicUrl);

    return res.json({
      url: data.publicUrl,
    });

  } catch (err) {
    console.error("❌ Upload PDF error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
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
