import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../config";
import StudentDashboardStats from "../components/StudentDashboardStats";

// Images
import concoursImg from "../assets/CONCOURS.jfif";
import mathsImg from "../assets/MATHS.jfif";
import physiqueImg from "../assets/PHYSIQUE.jfif";
import chimieImg from "../assets/CHIMIE.jfif";
import svtImg from "../assets/SVT.jfif";
import bgImage from "/Image3.jfif";

import AnimatedQaViewer from "../components/AnimatedQaViewer";
import { fetchAstucesByChapter, Astuce } from "../api/api";
import StudentSummaries from "./StudentSummaries";

interface Question {
  _id: string;
  texte: string;
  options: string[];
  reponseCorrecte: string;
  note: number;
}

export default function StudentPage() {
  // Navigation
  const [activeSection, setActiveSection] = useState<"home" | "dashboard">("home");
  const [section, setSection] = useState<"concours" | "matiere" | "soutien" | null>(null);

  // Sélections
  const [selectedMatiere, setSelectedMatiere] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [currentExam, setCurrentExam] = useState<string | null>(null);

  // QCM
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Astuces
  const [astuces, setAstuces] = useState<Astuce[]>([]);

  const matieres = ["Mathématique", "Physique", "Chimie", "SVT"];

  /* ============================
     CHARGEMENT DES QUESTIONS
  ============================ */
  useEffect(() => {
    if (!currentExam) return;

    const url = selectedMatiere
      ? `${API_BASE_URL}/api/questions?subject=${encodeURIComponent(
          selectedMatiere
        )}&exam=${encodeURIComponent(currentExam)}`
      : `${API_BASE_URL}/api/questions?exam=${encodeURIComponent(currentExam)}`;

    axios
      .get(url)
      .then((res) => setQuestions(res.data))
      .catch(() => setQuestions([]));
  }, [currentExam, selectedMatiere]);

  /* ============================
     CHARGEMENT DES ASTUCES
  ============================ */
  useEffect(() => {
    if (selectedAction === "Astuces" && selectedChapter) {
      fetchAstucesByChapter(selectedChapter)
        .then(setAstuces)
        .catch(() => setAstuces([]));
    }
  }, [selectedAction, selectedChapter]);

  /* ============================
     LOGIQUE QCM
  ============================ */
  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleFinish = () => {
    let total = 0;
    questions.forEach((q) => {
      if (answers[q._id] === q.reponseCorrecte) total += q.note;
    });
    setScore(total);
    setSubmitted(true);
  };

  /* ============================
     RENDU CENTRAL
  ============================ */
  const renderCenterContent = () => {
    // 📊 DASHBOARD
    if (activeSection === "dashboard") {
      return <StudentDashboardStats />;
    }

    // 📘 QCM
    if (currentExam) {
      return (
        <div className="p-4">
          <h2 className="text-xl font-bold text-center mb-4">
            📘 QCM — {currentExam}
          </h2>

          {questions.map((q, idx) => (
            <div key={q._id} className="p-4 mb-4 bg-white rounded-xl shadow">
              <h3 className="font-semibold mb-2">
                Q{idx + 1}) {q.texte} ({q.note} pt)
              </h3>

              {q.options.map((opt) => (
                <label key={opt} className="block mb-2">
                  <input
                    type="radio"
                    name={q._id}
                    disabled={submitted}
                    checked={answers[q._id] === opt}
                    onChange={() => handleAnswerChange(q._id, opt)}
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))}

          {!submitted ? (
            <button
              onClick={handleFinish}
              className="px-6 py-2 bg-green-600 rounded-lg"
            >
              Soumettre
            </button>
          ) : (
            <p className="font-bold text-center">
              Score : {score} / {questions.reduce((s, q) => s + q.note, 0)}
            </p>
          )}
        </div>
      );
    }

    // 🏠 PAR DÉFAUT
    return (
      <p className="text-center text-gray-600 mt-20">
        👈 Sélectionnez une section à gauche
      </p>
    );
  };

  /* ============================
     STRUCTURE
  ============================ */
  return (
    <div
      className="h-screen flex"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
      }}
    >
      {/* COLONNE GAUCHE */}
      <div className="w-64 bg-blue-900/60 p-4 text-white">
        <button
          className="mb-6 font-bold"
          onClick={() => {
            setActiveSection("dashboard");
            setSection(null);
            setCurrentExam(null);
          }}
        >
          📊 Mon tableau de bord
        </button>

        <h3 className="mb-2">🎯 QCE</h3>
        <button onClick={() => setSection("concours")}>Concours</button>
      </div>

      {/* COLONNE CENTRALE */}
      <div className="flex-1 bg-white/80 p-6 relative overflow-y-auto">
        {(section || currentExam || activeSection === "dashboard") && (
          <button
            onClick={() => {
              setActiveSection("home");
              setSection(null);
              setCurrentExam(null);
              setSelectedChapter(null);
              setSelectedAction(null);
            }}
            className="absolute top-4 right-4"
          >
            🔙 Retour
          </button>
        )}

        {renderCenterContent()}
      </div>
    </div>
  );
}
