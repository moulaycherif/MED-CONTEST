// src/pages/StudentQuiz.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  _id: string;
  texte: string;
  options: string[];
  reponseCorrecte: string;
  note: number;
}

interface Props {
  questions: Question[];
  answers: { [id: string]: string };
  onAnswerChange?: (id: string, value: string) => void;
  submitted: boolean;
  setSubmitted: (val: boolean) => void;
  score: number | null;
  setScore: (val: number) => void;
}

export default function StudentQuiz({
  questions,
  answers,
  onAnswerChange,
  submitted,
  setSubmitted,
  score,
  setScore,
}: Props) {
  const [validated, setValidated] = useState<{ [id: string]: boolean }>({});
  const [questionScores, setQuestionScores] = useState<{ [id: string]: number }>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleAnswerChange = (qId: string, value: string) => {
    if (onAnswerChange) onAnswerChange(qId, value);
  };

  const handleValidate = (q: Question) => {
    if (!answers[q._id]) return;
    setValidated((prev) => ({ ...prev, [q._id]: true }));
    setQuestionScores((prev) => ({
      ...prev,
      [q._id]: answers[q._id] === q.reponseCorrecte ? q.note : 0,
    }));
  };

  const handleFinish = () => {
    const newValidated = { ...validated };
    const newScores = { ...questionScores };

    questions.forEach((q) => {
      if (!newValidated[q._id]) {
        newValidated[q._id] = true;
        newScores[q._id] = answers[q._id] === q.reponseCorrecte ? q.note : 0;
      }
    });

    setValidated(newValidated);
    setQuestionScores(newScores);

    const total = Object.values(newScores).reduce((sum, val) => sum + val, 0);
    setScore(total);
    setSubmitted(true);
  };

  if (!currentQuestion) return <p>Aucune question disponible.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion._id}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 border rounded-2xl shadow bg-white"
        >
          <p className="font-bold text-xl mb-2">
            Q{currentIndex + 1}) {currentQuestion.texte}{" "}
            <span className="text-purple-600">({currentQuestion.note} pt)</span>
          </p>

          <div className="space-y-2">
            {currentQuestion.options.map((opt, i) => (
              <label
                key={i}
                className={`block p-3 border rounded-lg cursor-pointer transition ${
                  validated[currentQuestion._id]
                    ? opt === currentQuestion.reponseCorrecte
                      ? "bg-green-100 border-green-400"
                      : answers[currentQuestion._id] === opt
                      ? "bg-red-100 border-red-400"
                      : "opacity-60"
                    : "hover:bg-gray-100"
                }`}
              >
                <input
                  type="radio"
                  name={currentQuestion._id}
                  checked={answers[currentQuestion._id] === opt}
                  onChange={() => handleAnswerChange(currentQuestion._id, opt)}
                  disabled={validated[currentQuestion._id] || submitted}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>

          {!validated[currentQuestion._id] && !submitted && (
            <button
              onClick={() => handleValidate(currentQuestion)}
              disabled={!answers[currentQuestion._id]}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
            >
              Valider
            </button>
          )}

          {validated[currentQuestion._id] && (
            <div className="mt-3">
              <p className="font-semibold text-gray-800">
                🏅 Note obtenue : {questionScores[currentQuestion._id] ?? 0} pt
              </p>
              <p className="text-sm text-gray-700 mt-1">
                ✅ Bonne réponse : {currentQuestion.reponseCorrecte}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50"
        >
          Précédent
        </button>
        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Suivant
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Soumettre
          </button>
        )}
      </div>
    </div>
  );
}
