import mongoose from "mongoose";

const StudentActivitySchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
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
