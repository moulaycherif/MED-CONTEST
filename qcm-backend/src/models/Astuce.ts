import mongoose from "mongoose";

const AstuceSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    chapter: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },

    cases: {
      type: [
        {
          title: { type: String },
          content: { type: String },
        },
      ],
      default: [], // 🔥 TRÈS IMPORTANT
    },
    pdfUrl: {
  type: String,
},

    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Astuce", AstuceSchema);