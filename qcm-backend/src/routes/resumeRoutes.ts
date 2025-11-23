import express from "express";
import { Buffer } from "buffer";
import fs from "fs";
import path from "path";
import generateResumeBuffer from "../scripts/generateResume";
import Resume from "../models/resume";

const router = express.Router();

// ================================================
// 1️⃣ Générer PDF et le sauvegarder physiquement
// ================================================
router.post("/generate", async (req, res) => {
  try {
    const { subject, chapter, content } = req.body;

    if (!subject || !chapter || !content) {
      return res.status(400).json({ error: "Champs manquants." });
    }

    // PDF buffer
    const pdfBuffer = await generateResumeBuffer(subject, chapter, content);

    // Nom fichier
    const safeName = `${subject}_${chapter}`.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filePath = path.join(process.cwd(), "uploads/resumes", `${safeName}.pdf`);

    // Sauvegarde physique
    fs.writeFileSync(filePath, pdfBuffer);

    // URL accessible via frontend
    const pdfUrl = `/uploads/resumes/${safeName}.pdf`;

    // Sauvegarde en base
    await Resume.create({
      subject,
      chapter,
      pdfUrl,
    });

    res.json({ success: true, pdfUrl });

  } catch (err) {
    console.error("Erreur génération PDF :", err);
    res.status(500).json({ error: "Erreur lors de la génération du PDF." });
  }
});

// ================================================
// 2️⃣ Liste des résumés
// ================================================
router.get("/list", async (req, res) => {
  try {
    const items = await Resume.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Erreur /list :", err);
    res.status(500).json({ error: "Erreur lors du chargement des résumés." });
  }
});

// ================================================
// 3️⃣ Télécharger un PDF
// ================================================
router.get("/download/:filename", (req, res) => {
  const file = path.join(__dirname, "../uploads/resumes", req.params.filename);
  res.download(file);
});

export default router;
