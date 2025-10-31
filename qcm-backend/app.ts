import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import questionRoutes from "./routes/questionRoutes";
import answerRoutes from "./routes/answerRoutes";
import authRoutes from "./routes/authRoutes";

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
app.use("/api/answers", answerRoutes);

// ✅ Route test
app.get("/", (req, res) => {
  res.send("✅ API MED-CONTEST backend en ligne ! Utilisez /api/questions ou /api/auth pour interagir.");
});

export default app;
