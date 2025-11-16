import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  texte: string;
  options: string[];
  reponseCorrecte: string;
  subject: string;
  exam: string;
  note: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    texte: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: [
        (v: string[]) => v.length > 0,
        "Les options ne peuvent pas être vides",
      ],
    },
    reponseCorrecte: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    exam: { type: String, required: true, trim: true },
    note: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// ✅ Empêcher les doublons de texte pour un même examen
questionSchema.index({ texte: 1, exam: 1 }, { unique: true });

export default mongoose.model<IQuestion>("Question", questionSchema);
