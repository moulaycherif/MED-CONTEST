// qcm-backend/models/Exam.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IExam extends Document {
  title: string;
  subject: string;
  date: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IExam>("Exam", ExamSchema);
