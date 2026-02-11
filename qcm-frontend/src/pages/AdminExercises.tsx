import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

interface Quiz {
  _id: string;
  question: string;
  subject: string;
  chapter: string;
}

const AdminExercises: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  // 🔹 Charger tous les quiz
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
  try {
    const res = await axios.get<Quiz[]>(`${API_BASE_URL}/quiz`);

    const data = res.data;
    setQuizzes(data);

    const uniqueSubjects: string[] = Array.from(
      new Set(data.map(q => q.subject))
    );

    setSubjects(uniqueSubjects);
  } catch (err) {
    console.error("Erreur chargement quiz :", err);
  }
};


  // 🔹 Mettre à jour les chapitres selon la matière
  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]);
      return;
    }

    const filtered = quizzes.filter(q => q.subject === selectedSubject);
    const uniqueChapters = [...new Set(filtered.map(q => q.chapter))];
    setChapters(uniqueChapters);
    setSelectedChapter("");
  }, [selectedSubject, quizzes]);

  // 🔹 Filtrage final
  const filteredQuizzes = quizzes.filter(q => {
    return (
      (selectedSubject ? q.subject === selectedSubject : true) &&
      (selectedChapter ? q.chapter === selectedChapter : true)
    );
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        📘 Gestion des Exercices du Soutien
      </h1>

      {/* FILTRES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border p-3 rounded-lg"
        >
          <option value="">Toutes les matières</option>
          {subjects.map(subj => (
            <option key={subj} value={subj}>{subj}</option>
          ))}
        </select>

        <select
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(e.target.value)}
          className="border p-3 rounded-lg"
          disabled={!selectedSubject}
        >
          <option value="">Tous les chapitres</option>
          {chapters.map(chap => (
            <option key={chap} value={chap}>{chap}</option>
          ))}
        </select>
      </div>

      {/* TABLEAU */}
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Question</th>
            <th className="border p-2">Matière</th>
            <th className="border p-2">Chapitre</th>
          </tr>
        </thead>

        <tbody>
          {filteredQuizzes.map(q => (
            <tr key={q._id}>
              <td className="border p-2">{q.question}</td>
              <td className="border p-2 text-center">{q.subject}</td>
              <td className="border p-2 text-center">{q.chapter}</td>
            </tr>
          ))}

          {filteredQuizzes.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center p-6 text-gray-500">
                Aucun exercice trouvé
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminExercises;
