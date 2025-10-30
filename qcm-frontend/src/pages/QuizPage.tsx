// src/pages/QuizPage.tsx
import React, { useEffect, useState } from "react";

interface Question {
  _id: string;
  texte: string;
  options: string[];
  reponseCorrecte: string;
  subject: string;
  note: number;
}

interface QuizPageProps {
  questions: Question[];
  answers: { [id: string]: string };
  onAnswerChange: (questionId: string, value: string) => void;
  submitted: boolean;
  setSubmitted: (val: boolean) => void;
  score: number | null;
  setScore: (val: number) => void;
  setCurrentSubject: (val: string) => void;
}

const QuizPage: React.FC<QuizPageProps> = ({
  questions,
  answers,
  onAnswerChange,
  submitted,
  setSubmitted,
  score,
  setScore,
  setCurrentSubject,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [validated, setValidated] = useState<{ [id: string]: boolean }>({});
  const [questionScores, setQuestionScores] = useState<{ [id: string]: number }>({});
  const [showGrid, setShowGrid] = useState(false);

  const currentQuestion = questions[currentIndex];

  // ✅ Mise à jour automatique de la matière
  useEffect(() => {
    if (currentQuestion) setCurrentSubject(currentQuestion.subject);
  }, [currentQuestion, setCurrentSubject]);

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

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* ✅ Affiche une seule question à la fois */}
      {currentQuestion ? (
        <div className="p-5 border rounded-2xl shadow bg-white">
          {/* ✅ Question affichée en plus petit */}
          <p className="font-semibold text-lg text-gray-900 mb-3 leading-relaxed">
            Q{currentIndex + 1}) {currentQuestion.texte}
            <span className="text-purple-600 ml-2 text-sm">
              ({currentQuestion.note} pt)
            </span>
          </p>

          {/* ✅ Options avec bon design et meilleure lisibilité */}
          <div className="space-y-2">
            {currentQuestion.options.map((opt, i) => (
              <label
                key={i}
                className={`block p-3 border rounded-lg cursor-pointer transition text-sm md:text-base
                  ${
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
                  onChange={() => onAnswerChange(currentQuestion._id, opt)}
                  disabled={validated[currentQuestion._id] || submitted}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>

          {/* ✅ Bouton de validation */}
          {!validated[currentQuestion._id] && !submitted && (
            <button
              onClick={() => handleValidate(currentQuestion)}
              disabled={!answers[currentQuestion._id]}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm md:text-base disabled:opacity-50"
            >
              Valider
            </button>
          )}

          {/* ✅ Résultat de la question */}
          {validated[currentQuestion._id] && (
            <div className="mt-3 text-sm md:text-base">
              <p className="font-medium text-gray-800">
                🏅 Note obtenue : {questionScores[currentQuestion._id] ?? 0} pt
              </p>
              <p className="text-gray-700 mt-1">
                ✅ Bonne réponse :{" "}
                <span className="font-semibold">{currentQuestion.reponseCorrecte}</span>
              </p>
            </div>
          )}
        </div>
      ) : (
        <p>Aucune question disponible.</p>
      )}

      {/* ✅ Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-400 text-white rounded text-sm md:text-base disabled:opacity-50"
        >
          Précédent
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded text-sm md:text-base"
          >
            Suivant
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="px-4 py-2 bg-green-500 text-white rounded text-sm md:text-base"
          >
            Soumettre
          </button>
        )}
      </div>

      {/* ✅ Résultat final + Grille des corrections */}
      {score !== null && (
        <div className="mt-8 p-6 bg-gray-50 border rounded-2xl shadow">
          <h3 className="text-xl md:text-2xl font-bold text-center text-green-700 mb-4">
            🎉 Votre score : {score} / {questions.reduce((s, q) => s + q.note, 0)}
          </h3>

          <div className="text-center">
            <button
              onClick={() => setShowGrid((prev) => !prev)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg mb-4 transition text-sm md:text-base"
            >
              {showGrid ? "Masquer la grille" : "Afficher la grille"}
            </button>
          </div>

          {showGrid && (
            <div className="space-y-4">
              {questions.map((q, index) => {
                const isCorrect = answers[q._id] === q.reponseCorrecte;
                return (
                  <div
                    key={q._id}
                    className={`p-4 border rounded-xl text-sm md:text-base ${
                      isCorrect
                        ? "bg-green-50 border-green-300"
                        : "bg-red-50 border-red-300"
                    }`}
                  >
                    <h4 className="font-semibold text-gray-800 mb-1">
                      Question {index + 1}
                    </h4>
                    <p className="text-gray-700">
                      ✅ Bonne réponse :{" "}
                      <span className="font-semibold text-green-700">
                        {q.reponseCorrecte}
                      </span>
                    </p>
                    <p className="text-gray-600">🏅 Note : {isCorrect ? q.note : 0} pt</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizPage;
