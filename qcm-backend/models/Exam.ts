import mongoose, { Document, Schema } from "mongoose";

export interface IExam extends Document {
  nom: string;
  date: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    nom: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Exam ||
  mongoose.model<IExam>("Exam", ExamSchema);
