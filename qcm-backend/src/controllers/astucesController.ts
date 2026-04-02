import Astuce from "../models/Astuce";
import { Request, Response } from "express";
import { supabase } from "../config/supabase";

/* 🔵 ASTUCES PAR CHAPITRE */
export const getAstucesByChapter = async (req: Request, res: Response) => {
  try {
    const { chapter } = req.params;

    const astuces = await Astuce.find({
      chapter: { $regex: chapter, $options: "i" },
    }).sort({ order: 1 });

    // 🔥 NORMALISATION (ANTI-CRASH)
    const safeAstuces = astuces.map((tip: any) => ({
      ...tip._doc,
      cases: (tip.cases || [])
        .filter(Boolean)
        .map((c: any) => ({
          title: c?.title || "",
          explanation: c?.explanation || c?.content || "",
          example: c?.example || "",
        })),
    }));

    res.json(safeAstuces);
  } catch (error) {
    console.error("Erreur getAstucesByChapter:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* 🟢 CRÉATION ASTUCE */
export const createAstuce = async (req: Request, res: Response) => {
  try {
    const { subject, chapter, title, description, cases, pdfUrl } = req.body;

    if (!subject || !chapter || !title) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    // 🔥 NORMALISATION ICI AUSSI
    const normalizedCases = (cases || [])
      .filter((c: any) => c && (c.content || c.explanation))
      .map((c: any) => ({
        title: c.title || "",
        explanation: c.explanation || c.content || "",
        example: c.example || "",
      }));

    const astuce = new Astuce({
      subject,
      chapter,
      title,
      description,
      cases: normalizedCases,
      pdfUrl: pdfUrl || null,
    });

    await astuce.save();

    res.status(201).json(astuce);
  } catch (error) {
    console.error("Erreur createAstuce:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* 📄 UPLOAD PDF */
export const uploadAstucePdf = async (req: Request, res: Response) => {
  try {
    console.log("📥 Upload PDF");

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier" });
    }

    const file = req.file;
    const fileName = `astuces/${Date.now()}-${file.originalname}`;

    const { error } = await supabase.storage
      .from("astuces")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error("Erreur upload Supabase:", error);
      return res.status(500).json({ message: "Erreur upload" });
    }

    const { data } = supabase.storage
      .from("astuces")
      .getPublicUrl(fileName);

    return res.json({ pdfUrl: data.publicUrl });

  } catch (error) {
    console.error("❌ Erreur upload PDF:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};