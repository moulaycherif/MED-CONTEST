import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // index
});

const ExerciseSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    chapter: { type: String, required: true },
    questions: [QuestionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Exercise", ExerciseSchema);
