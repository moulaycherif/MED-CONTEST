import { Request, Response } from "express";
import Summary from "../models/resume";
import { uploadToSupabase } from "../services/supabaseUpload";
import Resume from "../models/resume";


export const createSummary = async (req: Request, res: Response) => {
  try {
    const { title, subject, chapter, content } = req.body;

    if (!title || !subject || !chapter || !content) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    // Convertir le texte en PDF simple
    const pdfBuffer = Buffer.from(content, "utf-8");

    const fileName = `${Date.now()}_${title.replace(/ /g, "_")}.pdf`;
    const publicUrl = await uploadToSupabase(pdfBuffer, fileName);

    const summary = new Summary({
      title,
      subject,
      chapter,
      pdfUrl: publicUrl,
    });

    await summary.save();

    res.json({ message: "Résumé créé", summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur création résumé" });
  }
};


export const importPDF = async (req: Request, res: Response) => {
  try {
    const { title, subject, chapter } = req.body;
    const pdfFile = req.file;

    if (!pdfFile) return res.status(400).json({ error: "Aucun fichier PDF" });

    const fileName = `${Date.now()}_${pdfFile.originalname.replace(/ /g, "_")}`;
    const publicUrl = await uploadToSupabase(pdfFile.buffer, fileName);

    const summary = new Summary({
      title,
      subject,
      chapter,
      pdfUrl: publicUrl,
    });

    await summary.save();

    res.json({ message: "PDF importé", summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur import PDF" });
  }
};


export const getAllSummaries = async (req: Request, res: Response) => {
  const summaries = await Summary.find().sort({ createdAt: -1 });
  res.json(summaries);
};

export const deleteSummary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await Summary.findByIdAndDelete(id);

    res.json({ message: "Résumé supprimé" });
  } catch (error) {
    res.status(500).json({ error: "Erreur suppression" });
  }
};

// 📌 Récupérer les résumés par matière pour l'étudiant
export const getResumesBySubject = async (req, res) => {
  try {
    const { subject } = req.params;

    const resumes = await Resume.find({ subject }).sort({ createdAt: -1 });

    return res.json(resumes);
  } catch (error) {
    console.error("❌ Erreur getResumesBySubject :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

