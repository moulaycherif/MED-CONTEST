// qcm-backend/models/Question.ts
import mongoose, { Document, Schema } from "mongoose";

// Interface TypeScript pour typer les questions
export interface IQuestion extends Document {
  texte: string;
  options: string[];
  reponseCorrecte: string;
  subject: string; // ✅ harmonisé
  exam: string;    // ✅ harmonisé
  note: number;    // ✅ champ pour le barème
}

const QuestionSchema: Schema = new Schema(
  {
    texte: { type: String, required: true },
    options: { type: [String], required: true },
    reponseCorrecte: { type: String, required: true },
    subject: { type: String, required: false }, // ✅ harmonisé
    exam: { type: String, required: false },    // ✅ harmonisé
    note: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IQuestion>("Question", QuestionSchema);
