import mongoose, { Document, Schema } from "mongoose";

export interface IExam extends Document {
  title: string;
  subject: string;
  date: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    title: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    subject: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema);

