import mongoose from "mongoose";

const StudentActivitySchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    type: { type: String, required: true }, // RESUME | ASTUCE | QCM | EXERCICE
    subject: String,
    chapter: String,
    referenceId: String,
  },
  {
    timestamps: true, // ⭐⭐⭐ OBLIGATOIRE ⭐⭐⭐
  }
);

export default mongoose.model("StudentActivity", StudentActivitySchema);
