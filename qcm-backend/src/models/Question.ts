import mongoose, { Document, Schema } from "mongoose";

export interface IQuestion extends Document {
  texte: string;
  image: String;
  options: string[];
  reponseCorrecte: string;
  subject: string;
  exam: string;
  note: number;
}

const QuestionSchema: Schema = new Schema(
  {
    texte: { type: String, required: true },
    image: { type: String },
    options: { type: [String], required: true },
    reponseCorrecte: { type: String, required: true },
    subject: { type: String, required: true },
    exam: { type: String, required: true },
    note: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema);
