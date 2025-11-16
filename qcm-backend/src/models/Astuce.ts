import mongoose from "mongoose";

const AstuceSchema = new mongoose.Schema({
  chapitre: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

export default mongoose.model("Astuce", AstuceSchema);
