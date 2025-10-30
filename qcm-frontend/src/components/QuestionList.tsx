// frontend/src/components/QuestionList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  exam: string;
}

const QuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/questions");
        setQuestions(response.data);
      } catch (err) {
        setError("Impossible de récupérer les questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) return <p>Chargement des questions...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Liste des Questions</h2>
      {questions.map((q) => (
        <div key={q._id} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
          <p><b>Question :</b> {q.questionText}</p>
          <ul>
            {q.options.map((opt, idx) => (
              <li key={idx}>{opt}</li>
            ))}
          </ul>
          <p><b>Réponse correcte :</b> {q.correctAnswer}</p>
          <p><i>{q.subject} - {q.exam}</i></p>
        </div>
      ))}
    </div>
  );
};

export default QuestionList;
