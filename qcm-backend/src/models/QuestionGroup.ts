import mongoose, { Schema, Document } from "mongoose";

export interface IQuestionGroup extends Document {
  imageGroup?: string | null;
  subject: string;
  exam: string;
  order?: number;
}

const questionGroupSchema = new Schema<IQuestionGroup>(
  {
    imageGroup: { type: String, default: null },
    subject: { type: String, required: true },
    exam: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.QuestionGroup ||
  mongoose.model<IQuestionGroup>("QuestionGroup", questionGroupSchema);
