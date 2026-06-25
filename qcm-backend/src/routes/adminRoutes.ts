import express from "express";
import bcrypt from "bcryptjs";
import Student from "../models/Student";
import { authenticateAdmin } from "../middleware/authAdmin";

const router = express.Router();

console.log("AdminRoutes :",Student);

router.get("/ping", (req, res) => {
  res.json({ message: "pong admin" });
});

import Admin from "../models/Admin"; // Vérifiez que le chemin vers votre modèle Admin est bon

// 🚨 ROUTE SECRÈTE TEMPORAIRE POUR CRÉER L'ADMIN
router.get("/force-create-admin", async (req, res) => {
  try {
    // Vérifie s'il existe déjà pour éviter les doublons
    const existingAdmin = await Admin.findOne({ email: "lamchich@uca.ac.ma" });
    if (existingAdmin) {
      return res.send("L'admin existe déjà !");
    }

    // Crypte le mot de passe (Mettez le mot de passe de votre choix ici)
    const hashedPassword = await bcrypt.hash("Moulaycherif@2020", 10); 

    // Création de l'admin
    const newAdmin = await Admin.create({
      email: "lamchich@uca.ac.ma", // Mettez votre vrai email admin
      password: hashedPassword,
      role: "admin" // Si votre modèle requiert un rôle
    });

    res.send("✅ Compte Admin créé avec succès ! Vous pouvez vous connecter.");
  } catch (error: any) {
    res.status(500).send("Erreur : " + error.message);
  }
});

// 🔹 Créer un étudiant (ADMIN)
router.post("/create-student", authenticateAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      name,
      email,
      password: hashedPassword,
    });

    await student.save();

    res.json({ message: "Étudiant créé ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
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
