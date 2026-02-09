import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const AdminExercices: React.FC = () => {
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  // ➕ Ajouter une question
  const addQuestion = () => {
    if (!currentQuestion || options.some((o) => !o)) {
      alert("Veuillez remplir la question et toutes les options");
      return;
    }

    setQuestions([
      ...questions,
      {
        question: currentQuestion,
        options,
        correctAnswer,
      },
    ]);

    setCurrentQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
  };

  // 💾 Enregistrer le quiz
  const saveQuiz = async () => {
    if (!subject || !chapter || questions.length === 0) {
      alert("Quiz incomplet");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_BASE_URL}/exercises`,
        { subject, chapter, questions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Quiz enregistré avec succès ✅");

      // Reset
      setSubject("");
      setChapter("");
      setQuestions([]);
    } catch (err) {
      console.error("Erreur création quiz :", err);
      alert("Erreur serveur");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        📘 Gestion des Exercices du Soutien
      </h1>

      {/* MATIÈRE */}
      <input
        className="border p-2 w-full mb-4"
        placeholder="Matière (ex: Physique)"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      {/* CHAPITRE */}
      <input
        className="border p-2 w-full mb-6"
        placeholder="Chapitre (ex: Cinématique)"
        value={chapter}
        onChange={(e) => setChapter(e.target.value)}
      />

      {/* QUESTION */}
      <textarea
        className="border p-2 w-full mb-4"
        placeholder="Énoncé de la question"
        value={currentQuestion}
        onChange={(e) => setCurrentQuestion(e.target.value)}
      />

      {/* OPTIONS */}
      {options.map((opt, i) => (
        <input
          key={i}
          className="border p-2 w-full mb-2"
          placeholder={`Option ${i + 1}`}
          value={opt}
          onChange={(e) => {
            const newOpts = [...options];
            newOpts[i] = e.target.value;
            setOptions(newOpts);
          }}
        />
      ))}

      {/* BONNE RÉPONSE */}
      <select
        className="border p-2 w-full mb-4"
        value={correctAnswer}
        onChange={(e) => setCorrectAnswer(Number(e.target.value))}
      >
        <option value={0}>Bonne réponse : Option 1</option>
        <option value={1}>Bonne réponse : Option 2</option>
        <option value={2}>Bonne réponse : Option 3</option>
        <option value={3}>Bonne réponse : Option 4</option>
      </select>

      <button
        onClick={addQuestion}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-6"
      >
        ➕ Ajouter la question
      </button>

      {/* LISTE QUESTIONS */}
      {questions.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Questions ajoutées :</h3>
          <ul className="list-disc pl-6">
            {questions.map((q, i) => (
              <li key={i}>{q.question}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={saveQuiz}
        className="bg-green-600 text-white px-6 py-3 rounded w-full text-lg"
      >
        💾 Enregistrer le Quiz
      </button>
    </div>
  );
};

export default AdminExercices;
