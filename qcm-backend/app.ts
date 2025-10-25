import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import questionRoutes from "./routes/questionRoutes";
import answerRoutes from "./routes/answerRoutes";
import authRoutes from "./routes/authRoutes";

dotenv.config({ path: "./.env" });

const app = express();

// Middlewares
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);

app.get("/", (req, res) => {
  res.send("✅ API QCM en ligne. Utilisez /api/questions pour interagir.");
});

export default app;
