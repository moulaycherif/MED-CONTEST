import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config";

interface Question {
  _id: string;
  texte: string;
  options: string[];
  reponseCorrecte: string;
  subject: string;
  note: number;
}

export default function StudentDashboardFull() {
  const [view, setView] = useState<"accueil" | "concoursList" | "matiereList" | "questions">("accueil");
  const [exams, setExams] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const subjects = ["Mathématiques", "Physique", "Chimie", "SVT"];

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/questions/exams`)
      .then((res) => setExams(res.data || []))
      .catch(console.error);
  }, []);

  const loadQuestions = (exam: string, subject?: string) => {
    const params: any = { exam };
    if (subject) params.subject = subject;
    axios
      .get(`${API_BASE_URL}/api/questions`, { params })
      .then((res) => {
        setQuestions(res.data || []);
        setView("questions");
      })
      .catch(console.error);
  };

  return (
    <div
      className="min-h-screen flex flex-col text-white"
      style={{
        backgroundImage: `url("/src/assets/bg_med.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ✅ BARRE SUPÉRIEURE AVEC LOGO */}
      <header className="w-full bg-[rgba(15,23,42,0.9)] backdrop-blur-md py-4 px-8 flex items-center shadow-lg">
        <img
          src="/src/assets/logo_med.png"
          alt="logo"
          className="h-12 w-12 mr-3 rounded-full border-2 border-white object-cover"
        />
        <h1 className="text-2xl font-extrabold text-[#facc15] tracking-wide">
          MED-CONTEST
        </h1>
      </header>

      {/* ✅ CONTENU GLOBAL : COLONNE GAUCHE + CENTRALE */}
      <div className="flex flex-1">
        {/* --- COLONNE GAUCHE --- */}
        <motion.div
          className="w-1/6 bg-[rgba(15,23,42,0.85)] backdrop-blur-md p-4 flex flex-col gap-8 items-center shadow-2xl border-r border-white/20"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="w-full text-center">
            <h2 className="text-[#facc15] font-bold text-lg mb-3">🧠 QCE par concours</h2>
            <motion.img
              src="/src/assets/concours.jfif"
              alt="concours"
              className="w-full h-32 object-cover rounded-lg mb-3 cursor-pointer hover:scale-105 transition"
              onClick={() => setView("concoursList")}
            />
            <button
              onClick={() => setView("concoursList")}
              className="w-full py-2 bg-[#2563eb] hover:bg-[#3b82f6] rounded-lg font-semibold transition"
            >
              🎯 Concours
            </button>
          </div>

          <div className="w-full text-center">
            <h2 className="text-[#facc15] font-bold text-lg mb-3">📘 QCE par matière</h2>
            <div className="flex flex-col gap-3">
              {subjects.map((matiere) => (
                <motion.div
                  key={matiere}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                >
                  <img
                    src={`/src/assets/${matiere.toLowerCase()}.jfif`}
                    alt={matiere}
                    className="w-full h-28 object-cover rounded-lg mb-1 border border-white/20"
                    onClick={() => {
                      setSelectedSubject(matiere);
                      setView("matiereList");
                    }}
                  />
                  <p className="text-center font-semibold">{matiere}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="w-full text-center">
            <h2 className="text-[#facc15] font-bold text-lg mb-3">💡 Soutien</h2>
            <div className="flex flex-col gap-3">
              {subjects.map((matiere) => (
                <motion.img
                  key={matiere}
                  src={`/src/assets/${matiere.toLowerCase()}_support.jfif`}
                  alt={matiere}
                  className="w-full h-28 object-cover rounded-lg cursor-pointer hover:scale-105 transition border border-white/20"
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* --- COLONNE CENTRALE --- */}
        <motion.div
          className="flex-1 p-8 backdrop-blur-md bg-white/10 rounded-l-2xl overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {view === "accueil" && (
            <p className="text-center text-[#f1f5f9] text-xl mt-32">
              👈 Clique sur une image ou un bouton à gauche pour commencer ton entraînement.
            </p>
          )}

          {view === "concoursList" && (
            <div>
              <h2 className="text-2xl font-bold text-center mb-6 text-[#facc15]">🏆 Choisis ton concours</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {exams.map((exam) => (
                  <motion.div
                    key={exam}
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/10 hover:bg-white/20 transition"
                    onClick={() => loadQuestions(exam)}
                  >
                    <img
                      src={`/src/assets/concours.jfif`}
                      alt={exam}
                      className="w-full h-36 object-cover"
                    />
                    <p className="text-center py-3 font-semibold">{exam}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {view === "matiereList" && selectedSubject && (
            <div>
              <h2 className="text-2xl font-bold text-center mb-6 text-[#facc15]">
                📘 {selectedSubject} — Choisis un concours
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {exams.map((exam) => (
                  <motion.div
                    key={exam}
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/10 hover:bg-white/20 transition"
                    onClick={() => loadQuestions(exam, selectedSubject)}
                  >
                    <img
                      src={`/src/assets/${selectedSubject.toLowerCase()}.jfif`}
                      alt={selectedSubject}
                      className="w-full h-36 object-cover"
                    />
                    <p className="text-center py-3 font-semibold">{exam}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {view === "questions" && (
            <div className="text-center mt-12 text-lg">
              📚 Page des questions — bientôt personnalisée selon le concours ou la matière.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
