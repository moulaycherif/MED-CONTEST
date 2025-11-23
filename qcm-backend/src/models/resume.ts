import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    chapter: { type: String, required: true },

    // Stockage PDF
    pdfBase64: { type: String, required: true },

    // URL pour "📄 Ouvrir"
    pdfUrl: { type: String, required: true },

    createdAt: { type: Date, default: Date.now }
  },
  { collection: "resumes" },
);

export default mongoose.model("Resume", ResumeSchema);
