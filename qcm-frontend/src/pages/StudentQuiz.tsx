// src/pages/StudentQuiz.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config";

interface Question {
  _id: string;
  texte: string;
  options: string[];
  reponseCorrecte: string;
  note: number;
}

export default function StudentQuiz() {
  const { examName, subject } = useParams<{ examName?: string; subject?: string }>();
  const location = useLocation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let url = "";
    if (location.pathname.startsWith("/exam/")) {
      url = `${API_BASE_URL}/api/questions?exam=${encodeURIComponent(examName || "")}`;
    } else if (location.pathname.startsWith("/matiere/")) {
      url = `${API_BASE_URL}/api/questions?subject=${encodeURIComponent(subject || "")}`;
    }

    axios
      .get(url)
      .then((res) => setQuestions(res.data))
      .catch(() => setQuestions([]));
  }, [examName, subject]);

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

  if (questions.length === 0)
    return <p className="text-center mt-20 text-gray-600">Aucune question trouvée.</p>;

  const current = questions[index];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
        {examName
          ? `QCM - ${decodeURIComponent(examName)}`
          : `QCM - ${decodeURIComponent(subject || "")}`}
      </h1>

      <AnimatePresence mode="wait">
        <motion.div
          key={current._id}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6 bg-white border rounded-2xl shadow"
        >
          <h2 className="font-bold text-xl mb-4">
            Q{index + 1}) {current.texte}{" "}
            <span className="text-purple-600">({current.note} pt)</span>
          </h2>

          {current.options.map((opt, i) => (
            <label
              key={i}
              className={`block p-3 border rounded-lg cursor-pointer mb-2 ${
                submitted
                  ? opt === current.reponseCorrecte
                    ? "bg-green-100 border-green-400"
                    : answers[current._id] === opt
                    ? "bg-red-100 border-red-400"
                    : ""
                  : "hover:bg-gray-100"
              }`}
            >
              <input
                type="radio"
                name={current._id}
                checked={answers[current._id] === opt}
                onChange={() => handleAnswerChange(current._id, opt)}
                disabled={submitted}
                className="mr-2"
              />
              {opt}
            </label>
          ))}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              disabled={index === 0}
              className="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50"
            >
              Précédent
            </button>

            {index < questions.length - 1 ? (
              <button
                onClick={() => setIndex((i) => i + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Suivant
              </button>
            ) : (
              <button onClick={handleFinish} className="px-4 py-2 bg-green-600 text-white rounded">
                Soumettre
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {submitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center text-lg font-semibold text-blue-700"
        >
          ✅ Score final : {score} / {questions.reduce((sum, q) => sum + q.note, 0)}
        </motion.div>
      )}
    </div>
  );
}
