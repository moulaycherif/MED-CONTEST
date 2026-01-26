import { useEffect, useState } from "react";
import axios from "axios";

console.log("🔥 QUESTION BROWSER");

const API = import.meta.env.VITE_API_BASE_URL;

interface Question {
  _id: string;
  texte?: string;
  image?: string | null;

  groupId?: {
    _id: string;
    image?: string | null;
  } | null;

  options: string[];
  reponseCorrecte: string;
  subject: string;
  exam: string;
}


export default function QuestionBrowser() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`${API}/api/questions`);
        console.log("QUESTIONS:", res.data);
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

      <ul className="space-y-6">
        {questions.map((q, index) => (
          <li key={q._id} className="p-4 border rounded-lg shadow space-y-3">

            <div className="font-semibold">
              Q{index + 1}
            </div>

            {/* 🖼 IMAGE */}
            {q.image && (
              <img
                src={`${API}${q.image}`}
                className="max-w-lg rounded shadow"
                alt="Question"
              />
            )}

            {/* 📝 TEXTE */}
            {q.texte && (
              <p className="font-medium">{q.texte}</p>
            )}

            {/* OPTIONS */}
            <ul className="list-disc pl-5 space-y-1">
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
