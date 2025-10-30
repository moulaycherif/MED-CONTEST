// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import QuestionCard from "@/components/QuestionCard";

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  exam: string;
}

export default function Dashboard() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filterType, setFilterType] = useState<"exam" | "subject" | "">("");
  const [exams, setExams] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Charger toutes les questions
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/questions")
      .then((res) => {
        const data: Question[] = res.data;
        setQuestions(data);

        setExams(Array.from(new Set(data.map((q) => q.exam))));
        setSubjects(Array.from(new Set(data.map((q) => q.subject))));
      })
      .catch((err) => console.error("❌ Erreur récupération questions:", err));
  }, []);

  // Filtrer dynamiquement
  const filteredQuestions = questions.filter((q) => {
    if (filterType === "exam" && selectedExam) return q.exam === selectedExam;
    if (filterType === "subject" && selectedSubject) return q.subject === selectedSubject;
    return false;
  });

  return (
    <div className="p-6 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">🎓 Mode Étudiant</h2>

      {/* Étape 1 : choix Concours / Matière */}
      {!filterType && (
        <div className="flex gap-6 justify-center">
          <button
            onClick={() => setFilterType("exam")}
            className="px-6 py-3 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Choisir par Concours
          </button>
          <button
            onClick={() => setFilterType("subject")}
            className="px-6 py-3 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Choisir par Matière
          </button>
        </div>
      )}

      {/* Étape 2 : afficher les choix */}
      {filterType === "exam" && (
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold">Liste des concours :</h3>
          <div className="flex gap-3 flex-wrap">
            {exams.map((exam) => (
              <button
                key={exam}
                className={`px-4 py-2 rounded border ${
                  selectedExam === exam ? "bg-indigo-600 text-white" : "bg-gray-100"
                }`}
                onClick={() => setSelectedExam(exam)}
              >
                {exam}
              </button>
            ))}
          </div>
        </div>
      )}

      {filterType === "subject" && (
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold">Liste des matières :</h3>
          <div className="flex gap-3 flex-wrap">
            {subjects.map((subj) => (
              <button
                key={subj}
                className={`px-4 py-2 rounded border ${
                  selectedSubject === subj ? "bg-teal-600 text-white" : "bg-gray-100"
                }`}
                onClick={() => setSelectedSubject(subj)}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Étape 3 : afficher les questions */}
      {(selectedExam || selectedSubject) && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-4">Questions :</h3>
          {filteredQuestions.length === 0 ? (
            <p className="text-gray-600">Aucune question trouvée.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredQuestions.map((q) => (
                <QuestionCard
                  key={q._id}
                  question={q}
                  selectedAnswer=""
                  onSelect={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
