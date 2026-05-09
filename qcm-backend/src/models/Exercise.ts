// models/Exercise.ts
import mongoose, { Document, Schema } from "mongoose";

// ======================================================
// 📘 Interface TypeScript
// ======================================================
export interface IExercise extends Document {
  subject: string;
  chapter: string;
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  explanation: string;
  questionImage: string;
  createdAt: Date;
  updatedAt: Date;
}

// ======================================================
// 🗄️ Schéma Mongoose
// ======================================================
const exerciseSchema = new Schema<IExercise>(
  {
    subject: {
      type: String,
      required: [true, "La matière est requise"],
      trim: true,
    },
    chapter: {
      type: String,
      required: [true, "Le chapitre est requis"],
      trim: true,
    },
    question: {
      type: String,
      required: [true, "La question est requise"],
    },
    options: {
      type: [String],
      required: [true, "Les options de réponse sont requises"],
      validate: {
        validator: function (val: string[]) {
          return val.length >= 2;
        },
        message: "Un exercice doit comporter au moins 2 options de réponse.",
      },
    },
    correctAnswer: {
      type: String,
      required: [true, "La bonne réponse est requise"],
    },
    difficulty: {
      type: String,
      enum: ['facile', 'moyen', 'difficile'],
      default: 'moyen',
    },
    explanation: {
      type: String,
      default: "", // 💡 Optionnel mais très utile
    },
    questionImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Génère automatiquement createdAt et updatedAt
  }
);

export default mongoose.models.Exercise || mongoose.model<IExercise>("Exercise", exerciseSchema);