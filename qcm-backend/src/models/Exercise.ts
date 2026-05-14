// models/Exercise.ts
import mongoose, { Document, Schema } from "mongoose";

// ======================================================
// 📘 Interfaces TypeScript
// ======================================================
export interface ISubQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface IExercise extends Document {
  subject: string;
  chapter: string;
  contextText: string;
  contextImage: string;
  subQuestions: ISubQuestion[];
  difficulty: 'facile' | 'moyen' | 'difficile';
  createdAt: Date;
  updatedAt: Date;
}

// ======================================================
// 🗄️ Schémas Mongoose
// ======================================================

// 1. Schéma pour une sous-question
const subQuestionSchema = new Schema<ISubQuestion>({
  questionText: {
    type: String,
    required: [true, "Le texte de la question est requis"],
  },
  options: {
    type: [String],
    required: [true, "Les options de réponse sont requises"],
    validate: {
      validator: function (val: string[]) {
        // On s'assure de ne compter que les options non vides
        const validOptions = val.filter(opt => opt && opt.trim() !== "");
        return validOptions.length >= 2;
      },
      message: "Une question doit comporter au moins 2 options de réponse valides.",
    },
  },
  correctAnswer: {
    type: String,
    required: [true, "La bonne réponse est requise"],
  },
  explanation: {
    type: String,
    default: "",
  },
});

// 2. Schéma global de l'exercice (Le Problème)
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
    contextText: {
      type: String,
      required: [true, "L'énoncé du problème (contexte) est requis"],
    },
    contextImage: {
      type: String,
      default: "",
    },
    subQuestions: {
      type: [subQuestionSchema], // 👈 Intégration du tableau de sous-questions
      required: true,
      validate: {
        validator: function (val: ISubQuestion[]) {
          return val.length >= 1;
        },
        message: "Un exercice doit comporter au moins 1 sous-question.",
      },
    },
    difficulty: {
      type: String,
      enum: ['facile', 'moyen', 'difficile'],
      default: 'moyen',
    },
  },
  {
    timestamps: true, // Génère automatiquement createdAt et updatedAt
  }
);

export default mongoose.models.Exercise || mongoose.model<IExercise>("Exercise", exerciseSchema);