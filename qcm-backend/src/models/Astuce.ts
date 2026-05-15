import mongoose from "mongoose";

const AstuceSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    chapter: { type: String, required: true },
    title: { type: String, required: false, default: "" },
    description: { type: String },

    cases: {
      type: [
        {
          title: { type: String, default: "" },
          content: { type: String },
           image: { type: String }, // 🔥 AJOUT ICI
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