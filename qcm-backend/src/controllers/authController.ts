import { Request, Response } from "express";
import User from "../models/Student";

console.log("🔥 AUTH CONTROLLER:");

// 🔹 Créer un étudiant (admin uniquement)
export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Cet email existe déjà" });

    const student = new User({ name, email, password, role: "student" });
    await student.save();

    res.json({ message: "Étudiant créé avec succès", student });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 🔹 Liste de tous les étudiants
export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 🔹 Supprimer un étudiant
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Étudiant supprimé" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
