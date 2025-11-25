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

    // --- 1️⃣ Construire un nom unique et sûr ---
    const safeName =
      `${subject}_${chapter}`.replace(/[^a-zA-Z0-9_-]/g, "_") + ".pdf";

    const filePathInBucket = `${safeName}`;

    // --- 2️⃣ Vérifier si ce PDF existe déjà dans Supabase ---
    const { data: existing, error: checkError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .list("", { search: safeName });

    if (checkError) {
      console.error("❌ Erreur check Supabase :", checkError);
    }

    let pdfUrl =
      `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${safeName}`;

    if (existing && existing.length > 0) {
      console.log("📌 Fichier déjà existant → aucune génération");

      // Vérifier si déjà en base
      const existingResume = await Resume.findOne({ subject, chapter });

      if (existingResume) {
        return res.status(200).json({
          success: true,
          alreadyExists: true,
          pdfUrl,
          url: pdfUrl,
          id: existingResume._id,
        });
      }

      // Sinon, ajouter en base
      const resume = await Resume.create({ subject, chapter, pdfUrl });

      return res.status(201).json({
        success: true,
        alreadyExists: true,
        pdfUrl,
        url: pdfUrl,
        id: resume._id,
      });
    }

    // --- 3️⃣ Le fichier n’existe pas → générer un nouveau PDF ---
    const pdfBuffer = await generateResumeBuffer(subject, chapter, content);

    // --- 4️⃣ Upload dans Supabase ---
    const { error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(filePathInBucket, pdfBuffer, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: false, // empêche l’écrasement
      });

    if (uploadError) {
      console.error("❌ Erreur upload Supabase:", uploadError);
      return res.status(500).json({
        error: "Erreur lors de l'upload vers Supabase.",
        details: uploadError.message,
      });
    }

    // --- 5️⃣ Sauvegarde dans MongoDB ---
    const resume = await Resume.create({
      subject,
      chapter,
      pdfUrl,
    });

    console.log("✔️ Nouveau PDF généré et uploadé :", pdfUrl);

    return res.status(201).json({
      success: true,
      pdfUrl,
      url: pdfUrl,
      id: resume._id,
    });
  } catch (err) {
    console.error("❌ Erreur génération PDF :", err);
    return res.status(500).json({
      error: "Erreur lors de la génération du PDF.",
      details: err instanceof Error ? err.message : err,
    });
  }
});


// ---------------------------------------------------------
// Liste des résumés
// ---------------------------------------------------------
router.get("/all", async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    return res.json(resumes);
  } catch (err) {
    console.error("Erreur fetch resumes :", err);
    return res.status(500).json({
      error: "Erreur lors du chargement des résumés.",
    });
  }
});

export default router;
