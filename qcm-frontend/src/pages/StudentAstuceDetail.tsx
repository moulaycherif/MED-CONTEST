import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useParams, useNavigate } from "react-router-dom";

interface TipCase {
  title: string;
  explanation: string;
  example: string;
}

interface Tip {
  _id: string;
  subject: string;
  chapter: string;
  title: string;
  description: string;
  cases: TipCase[];
}

const StudentAstuceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    fetchTip();
  }, []);

  const fetchTip = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tips/${id}`);
      setTip(res.data);
    } catch (err) {
      console.error("Erreur chargement astuce :", err);
    }
  };

  if (!tip) {
    return <div className="p-10 text-center">Chargement...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 underline"
      >
        ← Retour aux astuces
      </button>

      <div className="mb-6">
        <div className="text-sm text-gray-500">
          {tip.subject} • {tip.chapter}
        </div>
        <h1 className="text-3xl font-bold mt-2">{tip.title}</h1>
        {tip.description && (
          <p className="mt-3 text-gray-700">{tip.description}</p>
        )}
      </div>

      {/* CAS */}
      <div className="space-y-6">
        {tip.cases.map((c, index) => (
          <div
            key={index}
            className="border rounded-xl p-5 bg-white shadow"
          >
            <h2 className="text-xl font-semibold mb-2">
              🔹 {c.title}
            </h2>

            <p className="mb-3 text-gray-800 whitespace-pre-line">
              {c.explanation}
            </p>

            {c.example && (
              <div className="bg-gray-100 p-3 rounded mb-4">
                <strong>Exemple :</strong>
                <pre className="whitespace-pre-wrap mt-2">{c.example}</pre>
              </div>
            )}

            {/* FUTUR */}
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              onClick={() =>
                navigate(`/student/quiz?tip=${tip._id}&case=${index}`)
              }
            >
              🧠 S’entraîner sur cette astuce
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentAstuceDetail;
