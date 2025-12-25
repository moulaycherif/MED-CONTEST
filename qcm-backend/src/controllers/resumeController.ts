import { Request, Response } from "express";
import Summary from "../models/resume";
import { uploadToSupabase } from "../services/supabaseUpload";
import Resume from "../models/resume";
import { supabase } from "../utils/supabase";
import StudentActivity from "../models/StudentActivity";
import { AuthRequest } from "../middleware/auth";

export const createSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { title, subject, chapter, content } = req.body;

    if (!title || !subject || !chapter || !content) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    // Convertir le texte en PDF simple
    const pdfBuffer = Buffer.from(content, "utf-8");

    const fileName = `${Date.now()}_${title.replace(/ /g, "_")}.pdf`;

    const { publicUrl, path } = await uploadToSupabase(pdfBuffer, fileName);

    const summary = new Summary({
      title,
      subject,
      chapter,
      pdfUrl: publicUrl,
      storagePath: path,   // 🔥
    });

    await summary.save();

    res.json({ message: "Résumé créé", summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur création résumé" });
  }
};


export const importPDF = async (req: AuthRequest, res: Response) => {
  try {
    const { title, subject, chapter } = req.body;
    const pdfFile = req.file;

    if (!pdfFile) return res.status(400).json({ error: "Aucun fichier PDF" });

    const fileName = `${Date.now()}_${pdfFile.originalname.replace(/ /g, "_")}`;

    const { publicUrl, path } = await uploadToSupabase(pdfFile.buffer, fileName);

    const summary = new Summary({
      title,
      subject,
      chapter,
      pdfUrl: publicUrl,
      storagePath: path,   // 🔥
    });

    await summary.save();

    res.json({ message: "PDF importé", summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur import PDF" });
  }
};


export const getAllSummaries = async (req: AuthRequest, res: Response) => {
  const summaries = await Summary.find().sort({ createdAt: -1 });
  res.json(summaries);
};

export const deleteSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await Summary.findByIdAndDelete(id);

    res.json({ message: "Résumé supprimé" });
  } catch (error) {
    res.status(500).json({ error: "Erreur suppression" });
  }
};

// 📌 Récupérer les résumés par matière
export const getSignedResumeUrl = async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: "Résumé introuvable" });

    const bucket = process.env.SUPABASE_BUCKET!;

    let storagePath = resume.storagePath;

    // 🔥 Si l’ancien document n’a pas storagePath → on le reconstruit
    if (!storagePath && resume.pdfUrl) {
      const parts = resume.pdfUrl.split(`/object/public/${bucket}/`);
      if (parts.length !== 2) {
        return res.status(400).json({ message: "URL PDF invalide" });
      }
      storagePath = parts[1];

      // On le sauvegarde pour la prochaine fois
      resume.storagePath = storagePath;
      await resume.save();
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath!, 600);

    if (error) {
      console.error("❌ Supabase:", error);
      return res.status(500).json({ message: "Erreur Supabase" });
    }

    // 📊 Tracker activité étudiant
    await StudentActivity.create({
      studentId: req.user!.id,
      type: "RESUME",
      subject: resume.subject,
      chapter: resume.chapter,
      referenceId: resume._id.toString(),
    });

    res.json({ signedUrl: data.signedUrl });
  } catch (e) {
    console.error("❌ getSignedResumeUrl:", e);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

  // 📌 Générer une URL signée Supabase
export const getSignedResumeUrl = async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: "Résumé introuvable" });
    }

    const bucket = process.env.SUPABASE_BUCKET!;

    let filePath = resume.storagePath;

    // 🔁 Compatibilité anciens PDFs (sans storagePath)
    if (!filePath) {
      const url = new URL(resume.pdfUrl);
      const parts = url.pathname.split("/object/public/");
      filePath = parts[1];   // resumes/abc.pdf

      if (!filePath) {
        console.error("❌ Impossible d'extraire le path:", resume.pdfUrl);
        return res.status(400).json({ message: "Chemin PDF invalide" });
      }

      // 🔥 On corrige MongoDB automatiquement
      resume.storagePath = filePath;
      await resume.save();
      console.log("🛠 storagePath réparé :", filePath);
    }

    console.log("📄 SIGNED PATH =", filePath);

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 600); // 10 minutes

    if (error) {
      console.error("❌ Supabase :", error);
      return res.status(500).json({ message: "Erreur Supabase" });
    }

    // 📊 Log activité étudiant
    await StudentActivity.create({
      studentId: req.user!.id,
      type: "RESUME",
      subject: resume.subject,
      chapter: resume.chapter,
      referenceId: resume._id.toString(),
    });

    res.json({ signedUrl: data.signedUrl });
  } catch (err) {
    console.error("❌ getSignedResumeUrl :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
