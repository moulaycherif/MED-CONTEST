import express from "express";
import generateResume from "../scripts/generateResume";
import Resume from "../models/resume";

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const { subject, chapter, content } = req.body;

    if (!subject || !chapter || !content) {
      return res.status(400).json({ error: "Champs manquants." });
    }

    // Générer le PDF
    const pdfUrl = generateResume(subject, chapter, content);
    const fullUrl = `${req.protocol}://${req.get("host")}${pdfUrl}`;

    // Sauvegarder en base
    const resume = await Resume.create({
      subject,
      chapter,
      pdfUrl
    });

    res.json({ pdfUrl: fullUrl, resume });

  } catch (err) {
    console.error("Erreur génération résumé :", err);
    res.status(500).json({ error: "Erreur génération du résumé." });
  }
});

export default router;
