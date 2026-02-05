// qcm-backend/routes/adminRoutes.ts
import express from "express";
import Student from "../models/Student";
import { authenticateAdmin } from "../middleware/authAdmin";

const router = express.Router();

router.get("/ping", (req, res) => {
  res.json({ message: "pong admin" });
});

// ✅ Liste de tous les étudiants (protégée admin)
router.get("/students", authenticateAdmin, async (req, res) => {
  try {
    const students = await Student.find().select("-password"); // sans les mots de passe
    res.json(students);
  } catch (err) {
    console.error("Erreur récupération étudiants :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des étudiants" });
  }
});

// 🔹 Supprimer un étudiant
router.delete("/students/:id", authenticateAdmin, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Étudiant supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de la suppression" });
  }
});

export default router;
