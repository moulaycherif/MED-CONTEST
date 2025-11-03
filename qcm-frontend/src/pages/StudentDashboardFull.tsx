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
  const [mode, setMode] = useState<"parConcours" | "parMatiere" | "">("");
  const [exams, setExams] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [pageAstuce, setPageAstuce] = useState<string | null>(null);

  const mathChapters = ["Les suites", "Probabilité", "Fonctions", "Limites", "Équations diff.", "Vecteurs", "Complexes"];
  const physiqueChapters = ["Mécanique", "Électricité", "Optique", "Thermodynamique"];
  const chimieChapters = ["Atomistique", "Réactions", "Cinétique", "Équilibres chimiques"];
  const svtChapters = ["Génétique", "Évolution", "Écologie", "Biologie cellulaire"];

  // Charger les concours
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/questions/exams`)
      .then((res) => setExams(res.data || []))
      .catch(console.error);
  }, []);

  // Charger les matières selon le concours
  useEffect(() => {
    if (mode === "parMatiere" && selectedExam) {
      axios
        .get(`${API_BASE_URL}/api/questions/subjects/${encodeURIComponent(selectedExam)}`)
        .then((res) => setSubjects(res.data || []))
        .catch(console.error);
    }
  }, [mode, selectedExam]);

  // Charger les questions
  useEffect(() => {
    if (!selectedExam) {
      setQuestions([]);
      return;
    }
    const params: any = { exam: selectedExam };
    if (mode === "parMatiere" && selectedSubject) params.subject = selectedSubject;

    axios
      .get(`${API_BASE_URL}/api/questions`, { params })
      .then((res) => {
        setQuestions(res.data || []);
        setAnswers({});
        setSubmitted(false);
        setScore(null);
        setCurrentIndex(0);
      })
      .catch(console.error);
  }, [mode, selectedExam, selectedSubject]);

  // --- Fonctions de navigation ---
  const handleAnswerChange = (id: string, value: string) => setAnswers((prev) => ({ ...prev, [id]: value }));
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
    let chapters: string[] = [];
    if (pageAstuce === "Mathématiques") chapters = mathChapters;
    if (pageAstuce === "Physique") chapters = physiqueChapters;
    if (pageAstuce === "Chimie") chapters = chimieChapters;
    if (pageAstuce === "SVT") chapters = svtChapters;

    return (
      <div
        className="relative grid grid-cols-1 md:grid-cols-12 w-full min-h-screen text-white"
        style={{
          backgroundImage: `url("/src/Image3.jfif")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/50 z-0"></div>
        <div className="relative z-10 col-span-12 p-6">
          <button onClick={() => setPageAstuce(null)} className="mb-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
            ⬅️ Retour
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center">💡 Astuces - {pageAstuce}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {chapters.map((ch) => (
              <div key={ch} className="p-4 rounded-xl shadow bg-white/10 hover:bg-white/20 transition">
                <h4 className="font-semibold">{ch}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- PAGE PRINCIPALE ---
  return (
    <div
      className="relative grid grid-cols-1 md:grid-cols-12 gap-4 w-full min-h-screen transition-all duration-300 text-white"
      style={{
        backgroundImage: `url("/src/Image3.jfif")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* BOUTON MODE NUIT */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-2 right-4 bg-gray-800 text-white px-3 py-1 rounded z-10 hover:bg-gray-700"
      >
        {darkMode ? "☀️ Mode Jour" : "🌙 Mode Nuit"}
      </button>

      {/* 🧩 COLONNE GAUCHE – QCM */}
      <motion.div
        className="relative z-10 col-span-12 md:col-span-3 p-4 bg-white/20 backdrop-blur-md rounded-2xl"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h2 className="font-bold text-lg mb-3">📝 QCM par Catégorie</h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              setMode("parConcours");
              setSelectedExam("");
              setSelectedSubject("");
              setSubjects([]);
            }}
            className="py-2 px-3 bg-blue-700 hover:bg-blue-600 rounded font-semibold text-white"
          >
            🔹 Par Concours
          </button>
          <button
            onClick={() => {
              setMode("parMatiere");
              setSelectedExam("");
              setSelectedSubject("");
              setSubjects([]);
            }}
            className="py-2 px-3 bg-indigo-700 hover:bg-indigo-600 rounded font-semibold text-white"
          >
            📘 Par Matière
          </button>
        </div>

        {mode && (
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full mt-3 p-2 rounded bg-black/40 text-white"
          >
            <option value="">-- Sélectionner un concours --</option>
            {exams.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        )}

        {mode === "parMatiere" && selectedExam && (
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full mt-3 p-2 rounded bg-black/40 text-white"
          >
            <option value="">-- Sélectionner une matière --</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              if (selectedExam) {
                const params: any = { exam: selectedExam };
                if (mode === "parMatiere" && selectedSubject) params.subject = selectedSubject;
                axios
                  .get(`${API_BASE_URL}/api/questions`, { params })
                  .then((res) => {
                    setQuestions(res.data || []);
                    setAnswers({});
                    setSubmitted(false);
                    setScore(null);
                    setCurrentIndex(0);
                  })
                  .catch(console.error);
              }
            }}
            disabled={!selectedExam}
            className="flex-1 py-2 bg-green-700 hover:bg-green-600 text-white rounded"
          >
            ▶️ Démarrer
          </button>

          <button
            onClick={() => {
              setMode("");
              setSelectedExam("");
              setSelectedSubject("");
              setQuestions([]);
              setSubjects([]);
              setCurrentIndex(0);
            }}
            className="py-2 px-3 rounded bg-gray-700 hover:bg-gray-600 text-white"
          >
            ♻️ Réinit.
          </button>
        </div>
      </motion.div>

      {/* 📚 COLONNE CENTRALE – QUESTIONS */}
      <motion.div
        className="relative z-10 col-span-12 md:col-span-6 p-6 bg-white/10 backdrop-blur-md rounded-2xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-bold text-xl text-center mb-4">📖 Questions</h2>

        {questions.length === 0 ? (
          <p className="text-center text-gray-200">
            Aucune question chargée. Sélectionne un concours ou une matière pour commencer.
          </p>
        ) : (
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
      </motion.div>

      {/* 💡 COLONNE DROITE – ASTUCES */}
      <motion.div
        className="relative z-10 col-span-12 md:col-span-3 p-4 bg-white/20 backdrop-blur-md rounded-2xl"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h3 className="font-bold text-lg mb-3 text-center">💡 SOUTIEN</h3>
        <div className="grid grid-cols-2 gap-3">
          {["Mathématiques", "Physique", "Chimie", "SVT"].map((matiere) => (
            <button
              key={matiere}
              onClick={() => setPageAstuce(matiere)}
              className="py-2 px-3 bg-blue-600/70 hover:bg-blue-500 rounded font-semibold"
            >
              {matiere}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
