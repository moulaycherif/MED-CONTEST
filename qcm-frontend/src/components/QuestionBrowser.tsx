import { useEffect, useState } from "react";
import axios from "axios";

interface Question {
  _id: string;
  question: string;
  options: string[];
  answer: string;
}

export default function QuestionBrowser() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les questions au montage du composant
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/questions");
        setQuestions(res.data);
      } catch (err) {
        setError("Impossible de récupérer les questions 😢");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) return <p>Chargement des questions...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Liste des questions</h2>
      <ul className="space-y-4">
        {questions.map((q) => (
          <li key={q._id} className="p-3 border rounded-lg shadow">
            <p className="font-medium">{q.question}</p>
            <ul className="list-disc pl-5">
              {q.options.map((opt, i) => (
                <li key={i}>{opt}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
