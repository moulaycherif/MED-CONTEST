import express from "express";
import generateResumeBuffer from "../scripts/generateResume";
import Resume from "../models/resume";
import { supabase } from "../utils/supabase";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const { subject, chapter, content } = req.body;

    if (!subject || !chapter || !content) {
      return res.status(400).json({ error: "Champs manquants." });
    }

    // Génération du PDF
    const pdfBuffer = await generateResumeBuffer(subject, chapter, content);

    // Nom du fichier
    const safeName = `${subject}_${chapter}`.replace(/[^a-zA-Z0-9_-]/g, "_") + ".pdf";

    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(safeName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      console.error("Erreur upload Supabase:", error.message);
      return res.status(500).json({ error: "Erreur lors de l'upload du PDF." });
    }

    // URL public directe
    const pdfUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${safeName}`;

    // Sauvegarde en base MongoDB
    await Resume.create({
      subject,
      chapter,
      pdfUrl,
    });

    return res.json({ success: true, pdfUrl });

  } catch (err) {
    console.error("Erreur génération PDF :", err);
    return res.status(500).json({ error: "Erreur lors de la génération du PDF." });
  }
});

export default router;
