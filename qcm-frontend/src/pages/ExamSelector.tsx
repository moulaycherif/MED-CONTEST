import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ExamSelector() {
  const [exams, setExams] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const navigate = useNavigate();

  // Charger les examens
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/questions/exams")
      .then((res) => setExams(res.data))
      .catch((err) => console.error("❌ Erreur récupération examens :", err));
  }, []);

  // Charger les matières quand un examen est choisi
  useEffect(() => {
    if (!selectedExam) {
      setSubjects([]);
      return;
    }

    axios
      .get("http://localhost:5000/api/questions/subjects", {
        params: { exam: selectedExam },
      })
      .then((res) => {
        console.log("📘 Matières reçues :", res.data);
        setSubjects(res.data);
      })
      .catch((err) =>
        console.error("❌ Erreur récupération matières :", err)
      );
  }, [selectedExam]);

  const handleStart = () => {
    if (selectedExam && selectedSubject) {
      navigate(
        `/exam/${encodeURIComponent(selectedExam)}?matiere=${encodeURIComponent(
          selectedSubject
        )}`
      );
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎓 Sélectionner un examen</h1>

      {/* Sélecteur d’examen */}
      <select
        value={selectedExam}
        onChange={(e) => setSelectedExam(e.target.value)}
        className="p-2 border rounded w-full mb-4"
      >
        <option value="">-- Choisissez un examen --</option>
        {exams.map((exam, i) => (
          <option key={i} value={exam}>
            {exam}
          </option>
        ))}
      </select>

      {/* Sélecteur de matière */}
      <h2 className="text-xl font-semibold mb-2">📘 Sélectionner une matière</h2>
      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        disabled={!subjects.length}
        className="p-2 border rounded w-full mb-4"
      >
        <option value="">-- Choisissez une matière --</option>
        {subjects.map((subj, i) => (
          <option key={i} value={subj}>
            {subj}
          </option>
        ))}
      </select>

      {/* Bouton de démarrage */}
      <button
        onClick={handleStart}
        disabled={!selectedExam || !selectedSubject}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Commencer
      </button>
    </main>
  );
}
