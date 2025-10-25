"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const questionRoutes_1 = __importDefault(require("./routes/questionRoutes"));
const answerRoutes_1 = __importDefault(require("./routes/answerRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
dotenv_1.default.config({ path: "./.env" });
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/questions", questionRoutes_1.default);
app.use("/api/answers", answerRoutes_1.default);
app.get("/", (req, res) => {
    res.send("✅ API QCM en ligne. Utilisez /api/questions pour interagir.");
});
exports.default = app;
