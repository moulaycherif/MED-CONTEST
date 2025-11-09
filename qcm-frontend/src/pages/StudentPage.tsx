import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

interface Question {
  _id: string;
  texte: string;
  options: string[];
  reponseCorrecte: string;
  exam: string;
  subject: string;
}

export default function StudentPage() {
  const [mode, setMode] = useState<"matiere" | "concours" | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [exams, setExams] = useState<string[]>([]);
  const [currentExam, setCurrentExam] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  // 📘 Charger la liste des concours et matières
  useEffect(() => {
    if (mode === "matiere") {
      axios
        .get(`${API_BASE_URL}/api/questions`)
        .then((res) => {
          const mats = [...new Set(res.data.map((q: any) => q.subject))];
          setSubjects(mats);
        })
        .catch(() => setSubjects([]));
    } else if (mode === "concours") {
      axios
        .get(`${API_BASE_URL}/api/exams`)
        .then((res) => setExams(res.data))
        .catch(() => setExams([]));
    }
  }, [mode]);

  // 📄 Charger les questions selon le concours ou la matière sélectionnée
  useEffect(() => {
    if (currentExam) {
      setLoading(true);
      const url =
        currentExam.startsWith("MEDECINE")
          ? `${API_BASE_URL}/api/questions?exam=${encodeURIComponent(currentExam)}`
          : `${API_BASE_URL}/api/questions?subject=${encodeURIComponent(currentExam.toUpperCase())}`;

      axios
        .get(url)
        .then((res) => setQuestions(res.data))
        .catch(() => setQuestions([]))
        .finally(() => setLoading(false));
    }
  }, [currentExam]);

  // 🧭 Boutons retour
  const handleBack = () => {
    if (currentExam) {
      setCurrentExam(null);
      setQuestions([]);
    } else {
      setMode(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 🧭 Colonne gauche */}
      <aside className="w-64 bg-white border-r shadow-sm p-4 space-y-4">
        <h2 className="text-xl font-bold text-blue-700 mb-4 text-center">QCM Étudiant</h2>

        {!mode && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setMode("matiere")}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
            >
              QCM par matière
            </button>
            <button
              onClick={() => setMode("concours")}
              className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
            >
              QCM par concours
            </button>
          </div>
        )}

        {mode && (
          <button
            onClick={handleBack}
            className="mt-4 text-sm text-gray-600 hover:text-black underline"
          >
            ← Retour
          </button>
        )}
      </aside>

      {/* 🎯 Colonne centrale */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Liste des matières */}
        {mode === "matiere" && !currentExam && (
          <div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
              Choisis une matière
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {subjects.map((s) => (
                <div
                  key={s}
                  onClick={() => setCurrentExam(s)}
                  className="cursor-pointer bg-white shadow hover:shadow-lg rounded-xl p-4 text-center font-medium text-blue-600"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liste des concours */}
        {mode === "concours" && !currentExam && (
          <div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
              Choisis un concours
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {exams.map((exam) => {
                const year = exam.replace("MEDECINE ", "");
                return (
                  <div
                    key={exam}
                    onClick={() => setCurrentExam(`MEDECINE ${year}`)}
                    className="cursor-pointer bg-white shadow hover:shadow-lg rounded-xl p-4 text-center font-medium text-green-600"
                  >
                    {exam}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Liste des questions */}
        {currentExam && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              {currentExam}
            </h3>

            {loading ? (
              <p className="text-center text-gray-500">Chargement des questions...</p>
            ) : questions.length === 0 ? (
              <p className="text-center text-red-500 font-medium">
                Aucune question trouvée.
              </p>
            ) : (
              <div className="space-y-6">
                {questions.map((q, index) => (
                  <div
                    key={q._id}
                    className="bg-white shadow rounded-xl p-4 hover:shadow-lg transition"
                  >
                    <p className="font-semibold mb-2">
                      {index + 1}. {q.texte}
                    </p>
                    <ul className="list-disc ml-6 space-y-1">
                      {q.options.map((opt, i) => (
                        <li key={i}>{opt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
