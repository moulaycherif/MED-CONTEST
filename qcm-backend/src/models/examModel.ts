import mongoose, { Schema, Document } from "mongoose";

export interface IExam extends Document {
  title: string;
  date?: Date;
}

const examSchema = new Schema<IExam>({
  title: { type: String, required: true, unique: true, trim: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model<IExam>("Exam", examSchema);
