import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import questionRoutes from "./routes/questionRoutes";
import adminRoutes from "./routes/adminRoutes";  // ✅ AJOUT ICI

import resumeRoutes from "./routes/resumeRoutes";
import studentRoutes from "./routes/studentRoutes";
import dotenv from "dotenv";
import rankingRoutes from "./routes/rankingRoutes";
import path from "path";
import statsRoutes from "./routes/statsRoutes";


dotenv.config();

// dotenv.config({ path: "./.env" });

const app = express();

import fs from "fs";

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

if (!fs.existsSync("uploads/resumes")) {
  fs.mkdirSync("uploads/resumes", { recursive: true });
}


// ✅ Middleware CORS

app.use(cors({
  origin: [
    "http://localhost:5173",            // Frontend local
    "https://med-contest.vercel.app"    // Frontend déployé
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes principales
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/stats", statsRoutes);   // 🔥 OBLIGATOIRE
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/uploads/resumes", express.static(path.join(__dirname, "uploads/resumes")));


// ✅ Route test
app.get("/", (req, res) => {
  res.send("✅ API MED-CONTEST backend en ligne ! Utilisez /api/questions ou /api/auth pour interagir.");
});

export default app;
