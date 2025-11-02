import React, { useEffect, useState } from "react";
import axios from "axios";
import QuizPage from "./QuizPage"; // on réutilise ton composant existant
import { API_BASE_URL } from "../config";

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  exam: string;
}

export default function StudentPage() {
  const [mode, setMode] = useState<"exam" | "subject" | null>(null);
  const [exams, setExams] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Charger la liste des examens et matières
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/questions`)
      .then((res) => {
        const allQuestions: Question[] = res.data;

        const examsSet = new Set(allQuestions.map((q) => q.exam));
        const subjectsSet = new Set(allQuestions.map((q) => q.subject));

        setExams(Array.from(examsSet));
        setSubjects(Array.from(subjectsSet));
      })
      .catch((err) => console.error("❌ Erreur chargement examens/matières :", err));
  }, []);

  // Si l’étudiant a choisi un concours ou une matière → afficher QuizPage
  if (selectedExam || selectedSubject) {
    return (
      <QuizPage
        exam={selectedExam || ""}
        subject={selectedSubject || undefined}
      />
    );
  }

  return (
    <main className="p-6">
      <h1 clas
