import { Request, Response } from "express";
import Summary from "../models/resume";
import { uploadToSupabase } from "../services/supabaseUpload";
import Resume from "../models/resume";

const router = express.Router();

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

router.get("/signed/:id", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ error: "Introuvable" });

    const filePath = resume.pdfUrl.split("/").pop(); // nom du fichier

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .createSignedUrl(filePath!, 3600); // 1h

    if (error) throw error;

    res.json({ signedUrl: data.signedUrl });
  } catch (err) {
    res.status(500).json({ error: "Erreur signed URL" });
  }
});


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

    // 🔥 NORMALISATION POUR LE FRONTEND
    const formatted = resumes.map((r) => ({
      id: r._id,
      subject: r.subject,
      chapter: r.chapter,
      url: r.pdfUrl,                // ✅ champ attendu par le frontend
      created_at: r.createdAt,      // ✅ cohérent
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("❌ Erreur getResumesBySubject :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};


