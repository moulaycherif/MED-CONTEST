import mongoose, { Document, Schema } from "mongoose";

export interface IExam extends Document {
  title: string;      // Nom de l’examen (ex : MEDECINE 2025)
  subject: string;    // Matière ou catégorie
}

const ExamSchema = new Schema<IExam>({
  title: { type: String, required: true },
  subject: { type: String, required: true },
});

export default mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema);
