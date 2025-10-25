"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateStudent = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Student_1 = __importDefault(require("../models/Student"));
const SECRET = process.env.JWT_SECRET || "super_secret_key";
const authenticateStudent = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token)
        return res.status(401).json({ error: "Token manquant" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET);
        const student = await Student_1.default.findById(decoded.id);
        if (!student)
            return res.status(401).json({ error: "Étudiant non trouvé" });
        req.student = student;
        next();
    }
    catch (err) {
        return res.status(401).json({ error: "Token invalide" });
    }
};
exports.authenticateStudent = authenticateStudent;
