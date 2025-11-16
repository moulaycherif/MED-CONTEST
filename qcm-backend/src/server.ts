import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";
import http from "http";
import { initRankingSocket } from "./websocket/rankingSocket";

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/qcmdb";

console.log("✅ MONGO_URI utilisé :", MONGO_URI);

// 🔥 Création du serveur HTTP + WebSockets
const httpServer = http.createServer(app);
initRankingSocket(httpServer);

// 📌 Connexion MongoDB PUIS lancement du serveur (UNE SEULE FOIS)
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connecté à MongoDB");

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server + WebSocket running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ Erreur MongoDB :", err));
