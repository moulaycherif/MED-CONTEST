"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.getStudents = exports.createStudent = void 0;
const Student_1 = __importDefault(require("../models/Student"));
// 🔹 Créer un étudiant (admin uniquement)
const createStudent = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await Student_1.default.findOne({ email });
        if (existing)
            return res.status(400).json({ error: "Cet email existe déjà" });
        const student = new Student_1.default({ name, email, password, role: "student" });
        await student.save();
        res.json({ message: "Étudiant créé avec succès", student });
    }
    catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.createStudent = createStudent;
// 🔹 Liste de tous les étudiants
const getStudents = async (req, res) => {
    try {
        const students = await Student_1.default.find({ role: "student" }).select("-password");
        res.json(students);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.getStudents = getStudents;
// 🔹 Supprimer un étudiant
const deleteStudent = async (req, res) => {
    try {
        await Student_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: "Étudiant supprimé" });
    }
    catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};
exports.deleteStudent = deleteStudent;
