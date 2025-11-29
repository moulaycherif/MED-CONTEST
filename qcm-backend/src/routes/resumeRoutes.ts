import express from "express";
import generateResumeBuffer from "../scripts/generateResume";
import Resume from "../models/resume";
import { supabase } from "../utils/supabase";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();


import { upload } from "../utils/multerConfig";

router.post("/generate", upload.single("file"), async (req, res) => {

  try {
    const { subject, chapter, content } = req.body;

    if (!subject || !chapter || !content) {
      return res.status(400).json({ error: "Champs manquants." });
    }

    const safeName =
      `${subject}_${chapter}`
        .replace(/[^a-zA-Z0-9_-]/g, "_") + ".pdf";

    const bucket = process.env.SUPABASE_BUCKET!;

    // 👉 1. Vérifier si le fichier existe dans Supabase AVANT de le générer
    const { data: existingFile } = await supabase.storage
      .from(bucket)
      .list("", { search: safeName });

    if (existingFile && existingFile.length > 0) {
      console.log("📌 PDF existe déjà → pas de génération");

      const pdfUrl =
        `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${safeName}`;

      // 👉 Vérifier si entrée existe en base sinon la créer
      let resume = await Resume.findOne({ subject, chapter });
      if (!resume) {
        resume = await Resume.create({ subject, chapter, pdfUrl });
      }

      return res.status(200).json({
        success: true,
        pdfUrl,
        id: resume._id,
        alreadyExists: true,
      });
    }

    // 👉 2. Générer le PDF
    const pdfBuffer = await generateResumeBuffer(subject, chapter, content);

    // 👉 3. Upload vers Supabase
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(safeName, pdfBuffer, {
        contentType: "application/pdf",
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Erreur upload Supabase:", uploadError);
      return res.status(500).json({
        error: "Erreur upload Supabase",
        details: uploadError,
      });
    }

    const pdfUrl =
      `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${safeName}`;

    // 👉 4. Sauvegarder en base (éviter doublons)
    let resume = await Resume.findOne({ subject, chapter });
    if (!resume) {
      resume = await Resume.create({ subject, chapter, pdfUrl });
    } else {
      resume.pdfUrl = pdfUrl;
      await resume.save();
    }

    return res.status(201).json({
      success: true,
      pdfUrl,
      id: resume._id,
      alreadyExists: false,
    });

  } catch (err) {
    console.error("Erreur génération PDF :", err);
    return res.status(500).json({
      error: "Erreur lors de la génération du PDF",
      details: err instanceof Error ? err.message : err,
    });
  }
});


router.get("/all", async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    return res.json(resumes);
  } catch (err) {
    console.error("Erreur fetch resumes :", err);
    return res.status(500).json({ error: "Erreur lors du chargement des résumés." });
  }
});

export default router;
