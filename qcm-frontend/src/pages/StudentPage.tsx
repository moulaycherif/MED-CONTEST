import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../config";

// Images
import concoursImg from "../assets/CONCOURS.jfif";
import mathsImg from "../assets/MATHS.jfif";
import physiqueImg from "../assets/PHYSIQUE.jfif";
import chimieImg from "../assets/CHIMIE.jfif";
import svtImg from "../assets/SVT.jfif";
import bgImage from "/Image3.jfif";

import AnimatedQaViewer from "../components/AnimatedQaViewer";
import { fetchAstucesByChapter, Astuce } from "../api/astuces.api";
import StudentSummaries from "./StudentSummaries";
import StudentDashboardStats from "../components/stats/StudentDashboardStats";

/* =======================
   TYPES
======================= */

interface Question {
  _id: string;
  texte?: string;
  image?: string | null;

  groupId?: {
    _id: string;
    image?: string | null;
    order?: number;
  } | null;

  options: string[];
  reponseCorrecte: string;
  note: number;
}

/* =======================
   COMPONENT
======================= */

export default function StudentPage() {
  const [section, setSection] = useState<
    "home" | "concours" | "matiere" | "soutien" | "qcm"
  >("home");

  const [selectedMatiere, setSelectedMatiere] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const [currentExam, setCurrentExam] = useState<string | null>(null);
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const [astuces, setAstuces] = useState<Astuce[]>([]);
  const [exams, setExams] = useState<{ _id: string; title: string }[]>([]);

  const matieres = ["Mathématique", "Physique", "Chimie", "SVT"];

  /* =======================
     UTILS
  ======================= */

  const resetQcm = () => {
    setCurrentExam(null);
    setCurrentExamId(null);
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  /* =======================
     LOAD EXAMS
  ======================= */

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/questions/exams`)
      .then(res => setExams(res.data))
      .catch(err => console.error("❌ Exams load error", err));
  }, []);

  /* =======================
     LOAD QUESTIONS
  ======================= */

  useEffect(() => {
    if (!currentExam) return;

    let url = `${API_BASE_URL}/api/questions?exam=${encodeURIComponent(currentExam)}`;
    if (selectedMatiere) {
      url += `&subject=${encodeURIComponent(selectedMatiere)}`;
    }

    axios
      .get(url)
      .then(res => setQuestions(res.data))
      .catch(() => setQuestions([]));
  }, [currentExam, selectedMatiere]);

  /* =======================
     ASTUCES
  ======================= */

  useEffect(() => {
    if (selectedAction === "Astuces" && selectedChapter) {
      fetchAstucesByChapter(selectedChapter)
        .then(setAstuces)
        .catch(() => setAstuces([]));
    }
  }, [selectedAction, selectedChapter]);

  /* =======================
     ANSWERS
  ======================= */

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleFinish = async () => {
    if (!currentExamId) return;

    let total = 0;
    questions.forEach(q => {
      if (answers[q._id] === q.reponseCorrecte) total += q.note;
    });

    setScore(total);
    setSubmitted(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/student/exams/${currentExamId}/submit`,
        { answers, subject: selectedMatiere || "CONCOURS" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("❌ Erreur enregistrement QCM", err);
    }
  };

  /* =======================
     CENTER RENDER
  ======================= */

  const renderCenterContent = () => {
    /* ===== QCM ===== */
    if (section === "qcm" && currentExam) {
      let lastGroupId: string | null = null;

      return (
        <div className="p-4">
          <h2 className="text-xl font-bold text-center mb-4 text-blue-800">
            📘 QCM — {currentExam}
          </h2>

          {questions.map((q, idx) => {
            const showGroupImage =
              q.groupId?.image && q.groupId._id !== lastGroupId;

            if (q.groupId?._id) {
              lastGroupId = q.groupId._id;
            }

            return (
              <motion.div
                key={q._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 mb-4 bg-white rounded-xl shadow"
              >
                {/* IMAGE DE GROUPE */}
                {showGroupImage && (
                  <img
                    src={`${API_BASE_URL}${q.groupId!.image}`}
                    className="max-w-lg mx-auto my-4 rounded shadow"
                    alt="Image du groupe"
                  />
                )}

                {/* QUESTION */}
                <h3 className="font-semibold mb-2">
                  Q{idx + 1}) {q.texte}
                  <span className="text-purple-600"> ({q.note} pt)</span>
                </h3>

                {/* IMAGE SIMPLE */}
                {!q.groupId && q.image && (
                  <img
                    src={`${API_BASE_URL}${q.image}`}
                    className="max-w-lg my-3 rounded shadow"
                    alt="Illustration"
                  />
                )}

                {/* OPTIONS */}
                {q.options.map((opt, i) => (
                  <label
                    key={i}
                    className={`block p-2 border rounded-lg cursor-pointer mb-2 ${
                      submitted
                        ? opt === q.reponseCorrecte
                          ? "bg-green-100 border-green-400"
                          : answers[q._id] === opt
                          ? "bg-red-100 border-red-400"
                          : ""
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q._id}
                      checked={answers[q._id] === opt}
                      onChange={() => handleAnswerChange(q._id, opt)}
                      disabled={submitted}
                      className="mr-2"
                    />
                    {opt}
                  </label>
                ))}
              </motion.div>
            );
          })}

          {!submitted ? (
            <button
              onClick={handleFinish}
              className="mt-4 px-6 py-2 bg-green-600 text-black rounded-lg"
            >
              ✅ Soumettre
            </button>
          ) : (
            <div className="mt-4 text-center text-lg font-semibold text-blue-700">
              ✅ Score final : {score} /{" "}
              {questions.reduce((s, q) => s + q.note, 0)}
            </div>
          )}
        </div>
      );
    }

    return <StudentDashboardStats />;
  };

  /* =======================
     LAYOUT
  ======================= */

  return (
    <div
      className="h-screen w-screen flex text-black"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* SIDEBAR */}
      <motion.div className="w-1/8 bg-blue-900/40 p-4 flex flex-col gap-8">
        <button onClick={() => setSection("concours")}>Concours</button>
        {matieres.map(m => (
          <button key={m} onClick={() => { setSelectedMatiere(m); setSection("matiere"); }}>
            {m}
          </button>
        ))}
      </motion.div>

      {/* CENTER */}
      <motion.div className="flex-1 p-4 overflow-y-auto">
        {renderCenterContent()}
      </motion.div>
    </div>
  );
}
