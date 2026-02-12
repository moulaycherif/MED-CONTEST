import mongoose from "mongoose";

const AstuceSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },   // Mathématique
    chapter: { type: String, required: true },   // Chapitre I : Suites & Sommes
    title: { type: String, required: true },     // Astuce 1 : Sommes & Produits
    content: { type: String, required: true },   // Texte de l’astuce
    order: { type: Number, default: 0 },         // Ordre d’affichage
  },
  { timestamps: true }
);

export default mongoose.model("Astuce", AstuceSchema);
