// src/pages/StudentDashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  _id: string;
  texte: string;
  options: string[];
  reponseCorrecte: string;
  subject: string;
  note: number;
}

export default function StudentDashboard() {
  const [view, setView] = useState<"qcm" | "astuces" | "">("qcm");
  const [exams, setExams] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Charger les concours
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/questions/exams")
      .then((res) => setExams(res.data))
      .catch(console.error);
  }, []);

  // Charger les matières pour l'examen choisi
  useEffect(() => {
    if (selectedExam) {
      axios
        .get(`http://localhost:5000/api/questions/subjects/${encodeURIComponent(selectedExam)}`)
        .then((res) => setSubjects(res.data))
        .catch(console.error);
    }
  }, [selectedExam]);

  // Charger les questions pour examen/matière
  useEffect(() => {
    if (!selectedExam) return;

    const params: any = { exam: selectedExam };
    if (selectedSubject) params.subject = selectedSubject;

    axios
      .get("http://localhost:5000/api/questions", { params })
      .then((res) => {
        setQuestions(res.data);
        setAnswers({});
        setSubmitted(false);
        setScore(null);
      })
      .catch(console.error);
  }, [selectedExam, selectedSubject]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleFinish = () => {
    let total = 0;
    questions.forEach((q) => {
      if (answers[q._id] === q.reponseCorrecte) total += q.note;
    });
    setScore(total);
    setSubmitted(true);
  };

  return (
    <div className="flex gap-6 p-6 max-w-7xl mx-auto">
      {/* ===== Colonne gauche: QCM ===== */}
      <motion.div
        className="w-1/4 space-y-4"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-bold text-xl mb-2">📝 Traiter QCM</h2>
        <motion.div whileHover={{ scale: 1.03 }} className="space-y-2">
          <button
            onClick={() => setView("qcm")}
            className={`w-full px-4 py-2 rounded shadow ${
              view === "qcm" ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Choix par concours
          </button>
          <button
            onClick={() => setView("qcm")}
            className={`w-full px-4 py-2 rounded shadow ${
              view === "qcm" ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Choix par matière
          </button>
        </motion.div>

        {view === "qcm" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 mt-2">
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Sélectionner un concours --</option>
              {exams.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>

            {selectedExam && (
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">-- Sélectionner une matière --</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* ===== Colonne centre: Questions ===== */}
      <div className="flex-1 space-y-4">
        <h2 className="font-bold text-xl mb-2 text-center">📖 Questions</h2>

        {questions.length === 0 && <p className="text-center text-gray-500">Aucune question disponible.</p>}

        <AnimatePresence>
          {questions.map((q) => (
            <motion.div
              key={q._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 border rounded shadow bg-white hover:shadow-lg"
            >
              <p className="font-semibold mb-2">{q.texte} ({q.note} pt)</p>
              <div className="space-y-1">
                {q.options.map((opt, i) => (
                  <label
                    key={i}
                    className={`block p-2 border rounded cursor-pointer ${
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
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {questions.length > 0 && !submitted && (
          <motion.button
            onClick={handleFinish}
            whileHover={{ scale: 1.02 }}
            className="mt-2 w-full py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Soumettre
          </motion.button>
        )}

        {submitted && score !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-green-50 border border-green-300 rounded text-center font-bold"
          >
            🎉 Score obtenu: {score} / {questions.reduce((s, q) => s + q.note, 0)}
          </motion.div>
        )}
      </div>

      {/* ===== Colonne droite: Astuces ===== */}
      <motion.div
        className="w-1/4 space-y-4"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-bold text-xl mb-2">💡 Traiter Astuces</h2>
        <select className="w-full p-2 border rounded">
          <option value="">-- Choisir une matière --</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <motion.div className="p-4 border rounded shadow bg-gray-50 min-h-[200px]" animate={{ opacity: selectedSubject ? 1 : 0.5 }}>
          {selectedSubject ? (
            <p>Voici les astuces pour {selectedSubject}</p>
          ) : (
            <p>Sélectionnez une matière pour voir les astuces...</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
