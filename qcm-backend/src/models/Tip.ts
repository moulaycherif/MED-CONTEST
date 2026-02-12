import mongoose from "mongoose";

const TipSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    chapter: { type: String, required: true },

    title: { type: String, required: true },
    description: String,

    cases: [
      {
        title: String,
        explanation: String,
        example: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Tip", TipSchema);
