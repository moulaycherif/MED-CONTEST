import mongoose from "mongoose";

const QuestionGroupSchema = new mongoose.Schema({
  image: { type: String, required: true },
  subject: String,
  exam: String,
  order: Number,
});

export default mongoose.model("QuestionGroup", QuestionGroupSchema);
