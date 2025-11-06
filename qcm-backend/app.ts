import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import questionRoutes from "./routes/questionRoutes";
import resultRoutes from "./routes/answerRoutes";
import adminRoutes from "./routes/adminRoutes";  // ✅ AJOUT ICI

import studentRoutes from "./routes/studentRoutes";

import dotenv from "dotenv";


dotenv.config({ path: "./.env" });

const app = express();

// ✅ Middleware CORS

app.use(cors({
  origin: [
    "http://localhost:5173",            // Frontend local
    "https://med-contest.vercel.app"    // Frontend déployé
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes principales
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/student", studentRoutes);

// ✅ Route test
app.get("/", (req, res) => {
  res.send("✅ API MED-CONTEST backend en ligne ! Utilisez /api/questions ou /api/auth pour interagir.");
});

export default app;
