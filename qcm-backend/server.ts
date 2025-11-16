import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";
import astucesRoutes from "./routes/astuces.routes";  // 👈 AJOUT

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/qcmdb";

console.log("✅ MONGO_URI utilisé :", MONGO_URI);

// 👈 AJOUT : montage des routes
app.use("/api/astuces", astucesRoutes);
app.use("/api/resume", require("./routes/resumeRoutes"));

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connecté à MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Backend running sur le port ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ Erreur MongoDB :", err));
