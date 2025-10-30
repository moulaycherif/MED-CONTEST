import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

const ExamPage: React.FC = () => {
  const { examName } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // Charger les questions depuis l’API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/questions/exam/${examName}`);
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error("❌ Erreur fetch questions:", err);
      }
    };
    fetchQuestions();
  }, [examName]);

  // Choisir une réponse
  const handleAnswer = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  // Passer à la question suivante
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Revenir à la question précédente
  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Envoyer les réponses au backend
  const submitExam = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/questions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const result = await res.json();
      setScore(result.score);
      setShowResult(true);
    } catch (err) {
      console.error("❌ Erreur correction:", err);
    }
  };

  if (questions.length === 0) return <p>Chargement des questions...</p>;

  if (showResult) {
    return (
      <div>
        <h2>Résultat</h2>
        <p>
          Score : {score} / {questions.length}
        </p>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div>
      <h2>Concours : {examName}</h2>
      <h3>
        Question {currentIndex + 1} / {questions.length}
      </h3>
      <p>{q.questionText}</p>

      {q.options.map((opt, idx) => (
        <label key={idx} style={{ display: "block", margin: "5px 0" }}>
          <input
            type="radio"
            name={q._id}
            value={opt}
            checked={answers[q._id] === opt}
            onChange={() => handleAnswer(q._id, opt)}
          />
          {opt}
        </label>
      ))}

      <div style={{ marginTop: "20px" }}>
        <button onClick={prevQuestion} disabled={currentIndex === 0}>
          ⬅️ Précédent
        </button>
        {currentIndex < questions.length - 1 ? (
          <button onClick={nextQuestion}>Suivant ➡️</button>
        ) : (
          <button onClick={submitExam}>Terminer ✅</button>
        )}
      </div>
    </div>
  );
};

export default ExamPage;
