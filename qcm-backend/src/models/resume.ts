import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    chapter: { type: String, required: true },

    pdfUrl: { type: String, required: true },      // URL publique
    storagePath: { type: String, required: true }, // chemin réel Supabase
  },
  { timestamps: true }
);

export default mongoose.model("Resume", ResumeSchema);
