// models/StudentActivity.ts
import mongoose from "mongoose";

const StudentActivitySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: {
    type: String,
    enum: ["QCM", "CONCOURS", "ASTUCE", "RESUME", "EXERCICE"],
    required: true,
  },
  subject: String,
  chapter: String,
  referenceId: String, // examId, resumeId, astuceId…
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("StudentActivity", StudentActivitySchema);
