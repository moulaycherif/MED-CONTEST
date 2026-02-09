import mongoose from "mongoose";

const TipSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    chapter: { type: String },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Tip", TipSchema);
