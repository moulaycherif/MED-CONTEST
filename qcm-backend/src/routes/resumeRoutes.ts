import express from "express";
import generateResumeBuffer from "../scripts/generateResume";
import Resume from "../models/resume";

const router = express.Router();

// =====================================================
// 🔥 1. Générer PDF + stocker en base64
// =====================================================
router.post("/generate", async (req, res) => {
  try {
    const { subject, chapter, content } = req.body;

    if (!subject || !chapter || !content) {
      return res.status(400).json({ error: "Champs manquants." });
    }

    // Empêcher les doublons (matière + chapitre)
    const exists = await Resume.findOne({ subject, chapter });
    if (exists) {
      return res.status(400).json({
        error: "Un résumé pour cette matière et ce chapitre existe déjà.",
      });
    }

    // Génération du PDF
    const pdfBuffer = await generateResumeBuffer(subject, chapter, content);
    const pdfBase64 = pdfBuffer.toString("base64");

    // Sauvegarde
    const resume = await Resume.create({
      subject,
      chapter,
      pdfBase64,
      pdfUrl: `/api/resume/download/${subject}_${chapter}`,
    });

    res.json({
      message: "PDF généré avec succès",
      id: resume._id,
      pdfUrl: resume.pdfUrl,
    });

  } catch (err) {
    console.error("Erreur génération PDF :", err);
    res.status(500).json({ error: "Erreur lors de la génération du PDF." });
  }
});

// =====================================================
// 🔥 2. Télécharger PDF (depuis base64)
// =====================================================
router.get("/download/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const [subject, chapter] = key.split("_");

    const resume = await Resume.findOne({ subject, chapter });
    if (!resume || !resume.pdfBase64) {
      return res.status(404).json({ error: "PDF introuvable." });
    }

    const pdfBuffer = Buffer.from(resume.pdfBase64, "base64");

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=${subject}_${chapter}.pdf`,
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.error("Erreur /download :", err);
    res.status(500).json({ error: "Erreur lors du téléchargement." });
  }
});

// =====================================================
// 🔥 3. Liste des résumés
// =====================================================
router.get("/list", async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    console.error("Erreur /list :", err);
    res.status(500).json({ error: "Erreur chargement des résumés." });
  }
});

export default router;
