"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config({ path: "./.env" });
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/qcmdb";
console.log("✅ MONGO_URI utilisé :", MONGO_URI);
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => {
    console.log("✅ Connecté à MongoDB");
    app_1.default.listen(PORT, () => console.log(`🚀 Backend running sur http://localhost:${PORT}`));
})
    .catch((err) => console.error("❌ Erreur MongoDB :", err));
