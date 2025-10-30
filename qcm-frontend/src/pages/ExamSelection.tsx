import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ExamSelection() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/questions/exams")
      .then((res) => setExams(res.data))
      .catch((err) => console.error("❌ Erreur récupération examens :", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎓 Choisir un concours</h1>
      {loading ? (
        <p>⏳ Chargement des examens...</p>
      ) : exams.length === 0 ? (
        <p className="text-gray-600">Aucun examen disponible pour le moment.</p>
      ) : (
        <ul className="space-y-2">
          {exams.map((exam) => (
            <li key={exam} className="p-4 border rounded shadow flex justify-between items-center">
              <span className="font-semibold">{exam}</span>
              <button
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                onClick={() => navigate("/dashboard")}
              >
                Accéder au Dashboard
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
