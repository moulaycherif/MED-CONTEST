// models/Exercise.ts
import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  subject: String,       // Math, Physique...
  chapter: String,       // Chapitre
  question: String,
  options: [String],
  correctAnswer: String,
  difficulty: String, // facile, moyen, difficile
  explanation: String,   // 💡 optionnel (très utile)
  questionImage: {
  type: String,
  default: "",
},
});

export default mongoose.model("Exercise", exerciseSchema);
