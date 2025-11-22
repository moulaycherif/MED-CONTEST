import express from "express";
import generateResumeBuffer from "../scripts/generateResume";
import Resume from "../models/resume";

const router = express.Router();

// ====================================================
// 🔥 1. Route : Génération PDF (en BLOB)
// ====================================================
router.post("/generate", async (req, res) => {
  try {
    const { subject, chapter, content } = req.body;

    if (!subject || !chapter || !content) {
      return res.status(400).json({ error: "Champs manquants." });
    }

    // Générer le PDF en mémoire
    const pdfBuffer = await generateResumeBuffer(subject, chapter, content);

    // Sauvegarde en base (optionnelle)
    await Resume.create({
      subject,
      chapter,
      pdfUrl: null // pas de fichier physique sur Render
    });

    // Envoi du PDF
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${subject}_${chapter}.pdf`,
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.error("Erreur génération résumé :", err);
    res.status(500).json({ error: "Erreur génération du PDF." });
  }
});

// ====================================================
// 🔥 2. Route : Liste des résumés
// ====================================================
router.get("/list", async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    console.error("Erreur /list :", err);
    res.status(500).json({ error: "Erreur lors du chargement des résumés." });
  }
});

export default router;
