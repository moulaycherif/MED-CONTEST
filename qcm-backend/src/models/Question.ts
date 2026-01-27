import mongoose, { Schema, Document } from "mongoose";

console.log("QUESTION MODELS FILE:", __filename);


export interface IQuestion extends Document {
  texte?: string;
  image?: string | null;
  options?: string[];
  reponseCorrecte?: string;
  subject: string;
  exam: string;
  note?: number;

  isGroup: boolean;
  groupId?: mongoose.Types.ObjectId | null;
}

const questionSchema = new Schema<IQuestion>(
  {
    texte: { type: String, default: null, trim: true },
    image: { type: String, default: null },

    options: { type: [String], default: [] },
    reponseCorrecte: { type: String, default: null },

    subject: { type: String, required: true },
    exam: { type: String, required: true },
    note: { type: Number, default: 1 },

    isGroup: { type: Boolean, default: false },
    groupId: { type: Schema.Types.ObjectId, ref: "Question", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", questionSchema);
