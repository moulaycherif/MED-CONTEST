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
  const [darkMode, setDarkMode] = useState(true);
  const [view, setView] = useState<"accueil" | "concoursList" | "matiereList" | "questions" | "astuce">("accueil");
  const [exams, setExams] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [pageAstuce, setPageAstuce] = useState<string | null>(null);

  const subjects = ["Mathématiques", "Physique", "Chimie", "SVT"];

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/questions/exams`)
      .then((res) => setExams(res.data || []))
      .catch(console.error);
  }, []);

  // Charger les questions selon le concours ou la matière choisie
  const loadQuestions = (exam: string, subject?: string) => {
    const params: any = { exam };
    if (subject) params.subject = subject;
    axios
      .get(`${API_BASE_URL}/api/questions`, { params })
      .then((res) => {
        setQuestions(res.data || []);
        setAnswers({});
        setSubmitted(false);
        setScore(null);
        setCurrentIndex(0);
        setView("questions");
      })
      .catch(console.error);
  };

  const handleAnswerChange = (id: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const handleSubmit = () => {
    let total = 0;
    questions.forEach((q) => {
      if (answers[q._id] === q.reponseCorrecte) total += q.note ?? 1;
    });
    setScore(total);
    setSubmitted(true);
  };

  const handleNext = () => currentIndex < questions.length - 1 && setCurrentIndex(currentIndex + 1);
  const handlePrev = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);
  const currentQuestion = questions[currentIndex];

  // --- PAGE ASTUCES ---
  if (pageAstuce) {
    const astuceMatiere = pageAstuce;
    const chapitres: Record<string, string[]> = {
      Mathématiques: ["Suites", "Probabilités", "Fonctions", "Limites", "Équations diff."],
      Physique: ["Mécanique", "Électricité", "Optique", "Thermodynamique"],
      Chimie: ["Atomistique", "Réactions chimiques", "Cinétique", "Équilibres chimiques"],
      SVT: ["Génétique", "Évolution", "Biologie cellulaire", "Écologie"],
    };

    return (
      <div
        className="relative grid grid-cols-12 gap-4 w-full min-h-screen text-white"
        style={{
          backgroundImage: `url("/src/Image3.jfif")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50 z-0"></div>
        <div className="relative z-10 col-span-12 p-6">
          <button onClick={() => setPageAstuce(null)} className="mb-4 px-4 py-2 bg-gray-700 rounded">
            ⬅️ Retour
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center">💡 Astuces - {astuceMatiere}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {chapitres[astuceMatiere].map((ch) => (
              <div key={ch} className="p-4 rounded-xl shadow bg-white/10 hover:bg-white/20 transition">
                {ch}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative grid grid-cols-12 gap-4 w-full min-h-screen text-white"
      style={{
        backgroundImage: `url("/src/Image3.jfif")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* Bouton mode sombre */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-2 right-4 bg-gray-800 text-white px-3 py-1 rounded z-10 hover:bg-gray-700"
      >
        {darkMode ? "☀️ Mode Jour" : "🌙 Mode Nuit"}
      </button>

      {/* 🧩 COLONNE GAUCHE */}
      <motion.div
        className="relative z-10 col-span-12 md:col-span-2 p-3 bg-white/20 backdrop-blur-md rounded-2xl space-y-6"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div>
          <h2 className="font-bold text-lg mb-2">🧠 QCE par concours</h2>
          <button
            onClick={() => setView("concoursList")}
            className="w-full py-2 bg-blue-700 hover:bg-blue-600 rounded-lg font-semibold"
          >
            🎯 Concours
          </button>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-2">📘 QCE par matière</h2>
          <div className="grid grid-cols-2 gap-3">
            {subjects.map((matiere) => (
              <button
                key={matiere}
                onClick={() => {
                  setSelectedSubject(matiere);
                  setView("matiereList");
                }}
                className="py-2 px-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded font-semibold"
              >
                {matiere}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-2">💡 Soutien</h2>
          <div className="grid grid-cols-2 gap-3">
            {subjects.map((matiere) => (
              <button
                key={matiere}
                onClick={() => setPageAstuce(matiere)}
                className="py-2 px-3 bg-green-700 hover:bg-green-600 text-white rounded font-semibold"
              >
                {matiere}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 🎯 COLONNE CENTRALE */}
      <motion.div
        className="relative z-10 col-span-12 md:col-span-6 p-6 bg-white/10 backdrop-blur-md rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {view === "accueil" && (
          <p className="text-center text-gray-200 text-lg mt-20">
            👈 Choisis un mode à gauche pour commencer ton entraînement.
          </p>
        )}

        {view === "concoursList" && (
          <div>
            <h2 className="text-xl font-bold text-center mb-4">🏆 Choisis ton concours</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {exams.map((exam) => (
                <motion.div
                  key={exam}
                  whileHover={{ scale: 1.05 }}
                  className="p-3 bg-white/20 rounded-xl text-center cursor-pointer hover:bg-white/30 transition"
                  onClick={() => loadQuestions(exam)}
                >
                  <img
                    src={`/src/assets/concours.jpg`}
                    alt={exam}
                    className="w-full h-28 object-cover rounded-md mb-2"
                  />
                  <p className="font-semibold">{exam}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {view === "matiereList" && selectedSubject && (
          <div>
            <h2 className="text-xl font-bold text-center mb-4">
              📘 {selectedSubject} — Choisis un concours
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {exams.map((exam) => (
                <motion.div
                  key={exam}
                  whileHover={{ scale: 1.05 }}
                  className="p-3 bg-white/20 rounded-xl text-center cursor-pointer hover:bg-white/30 transition"
                  onClick={() => loadQuestions(exam, selectedSubject)}
                >
                  <img
                    src={`/src/assets/${selectedSubject.toLowerCase()}.jpg`}
                    alt={selectedSubject}
                    className="w-full h-28 object-cover rounded-md mb-2"
                  />
                  <p className="font-semibold">{exam}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {view === "questions" && questions.length > 0 && (
          <>
            <p className="font-semibold mb-3">
              {currentQuestion.texte}{" "}
              <span className="text-sm text-purple-300">
                ({currentQuestion.note ?? 1} pt)
              </span>
            </p>
            {currentQuestion.options.map((opt, i) => (
              <label
                key={i}
                className={`block p-2 border rounded cursor-pointer ${
                  submitted
                    ? opt === currentQuestion.reponseCorrecte
                      ? "bg-green-700 border-green-500"
                      : answers[currentQuestion._id] === opt
                      ? "bg-red-700 border-red-500"
                      : ""
                    : "hover:bg-white/10"
                }`}
              >
                <input
                  type="radio"
                  name={currentQuestion._id}
                  checked={answers[currentQuestion._id] === opt}
                  onChange={() => handleAnswerChange(currentQuestion._id, opt)}
                  disabled={submitted}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}

            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded disabled:opacity-50"
              >
                ⬅️
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded disabled:opacity-50"
              >
                ➡️
              </button>
            </div>

            <p className="text-center text-gray-200 mt-3">
              Question {currentIndex + 1} / {questions.length}
            </p>

            {!submitted && currentIndex === questions.length - 1 && (
              <button
                onClick={handleSubmit}
                className="mt-4 w-full py-2 bg-green-700 hover:bg-green-800 rounded"
              >
                ✅ Soumettre
              </button>
            )}

            {submitted && score !== null && (
              <div className="mt-4 p-4 bg-green-800 border border-green-600 rounded text-center font-semibold">
                🎉 Score : {score} / {questions.reduce((s, q) => s + (q.note ?? 1), 0)}
              </div>
            )}
          </>
        )}
        <h3 className="font-bold text-lg mb-3 text-center">📊 Informations</h3>
        <p className="text-gray-200 text-center">
          Résultats, progression, et statistiques à venir ici 📈
        </p>
            </motion.div>
            
    </div>
  );
}
