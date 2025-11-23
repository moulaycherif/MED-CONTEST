import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    chapter: { type: String, required: true },
    pdfUrl: { type: String, required: true }, // Fichier sur le serveur
  },
  { timestamps: true }
);

export default mongoose.model("Resume", ResumeSchema);
