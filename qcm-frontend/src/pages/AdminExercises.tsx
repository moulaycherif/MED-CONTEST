import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

import "react-quill/dist/quill.snow.css";
import RichMathEditor from "../components/RichMathEditor";

// 1. Mise à jour de l'interface pour correspondre à la nouvelle structure
interface SubQuestion {
  _id?: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Exercise {
  _id: string;
  subject: string;
  chapter: string;
  contextText: string;
  contextImage?: string;
  subQuestions: SubQuestion[];
}

const AdminExercises: React.FC = () => {
  // Liste et filtres
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);

  // 🔹 États de base
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");

  // 🔹 NOUVEAUX ÉTATS : Énoncé (Contexte)
  const [contextText, setContextText] = useState("");
  const [contextImage, setContextImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 🔹 NOUVEAUX ÉTATS : Sous-questions
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([
    { questionText: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" },
  ]);

  // Charger tous les exercices au montage
  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/exercises`);
      const data: Exercise[] = res.data;

      setExercises(data);

      const uniqueSubjects = Array.from(new Set(data.map((q) => q.subject)));
      setSubjects(uniqueSubjects);
    } catch (err) {
      console.error("Erreur chargement exercices :", err);
    }
  };

  // Mettre à jour les chapitres selon la matière sélectionnée
  useEffect(() => {
    if (!subject) {
      setChapters([]);
      return;
    }

    const filtered = exercises.filter((q) => q.subject === subject);
    const uniqueChapters = [...new Set(filtered.map((q) => q.chapter))];
    setChapters(uniqueChapters);
    setChapter("");
  }, [subject, exercises]);

  // Gérer la prévisualisation de l'image
  useEffect(() => {
    if (!contextImage) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(contextImage);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [contextImage]);

  // Filtrage du tableau
  const filteredExercises = exercises.filter((q) => {
    return (
      (subject ? q.subject === subject : true) &&
      (chapter ? q.chapter === chapter : true)
    );
  });

  // 🔹 GESTION DES SOUS-QUESTIONS
  const handleAddSubQuestion = () => {
    setSubQuestions([
      ...subQuestions,
      { questionText: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" },
    ]);
  };

  const handleRemoveSubQuestion = (index: number) => {
    const updated = [...subQuestions];
    updated.splice(index, 1);
    setSubQuestions(updated);
  };

  const handleSubQuestionChange = (index: number, field: keyof SubQuestion, value: string) => {
    const updated = [...subQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setSubQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...subQuestions];
    updated[qIndex].options[optIndex] = value;
    setSubQuestions(updated);
  };

  // 🔹 SOUMISSION
  const handleSubmit = async () => {
    if (!subject || !chapter || !contextText) {
      alert("⚠️ Veuillez remplir la matière, le chapitre et l'énoncé principal.");
      return;
    }

    // Vérifier si toutes les sous-questions ont une bonne réponse valide
    for (let i = 0; i < subQuestions.length; i++) {
      if (!subQuestions[i].correctAnswer) {
        alert(`⚠️ Veuillez sélectionner la bonne réponse pour la question ${i + 1}.`);
        return;
      }
    }

    try {
      const adminToken = localStorage.getItem("adminToken");

      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("chapter", chapter);
      formData.append("contextText", contextText); // Nouveau format
      formData.append("subQuestions", JSON.stringify(subQuestions)); // Nouveau format

      if (contextImage) {
        formData.append("contextImage", contextImage); // Nouveau format
      }

      await axios.post(`${API_BASE_URL}/api/exercises`, formData, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Exercice ajouté avec succès");

      // Reset
      setSubject("");
      setChapter("");
      setContextText("");
      setContextImage(null);
      setSubQuestions([{ questionText: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" }]);

      fetchExercises();
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de l'ajout de l'exercice");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        📘 Gestion des Exercices du Soutien
      </h1>

      {/* FILTRES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border p-3 rounded-lg"
        >
          <option value="">Toutes les matières</option>
          {subjects.map((subj) => (
            <option key={subj} value={subj}>{subj}</option>
          ))}
        </select>

        <select
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          className="border p-3 rounded-lg"
          disabled={!subject}
        >
          <option value="">Tous les chapitres</option>
          {chapters.map((chap) => (
            <option key={chap} value={chap}>{chap}</option>
          ))}
        </select>
      </div>

      {/* FORMULAIRE D'AJOUT */}
      <div className="mb-8 p-6 border rounded-lg shadow bg-white">
        <h2 className="text-xl font-bold mb-4">Créer un nouvel exercice</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Matière"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Chapitre"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* 📚 PARTIE 1 : L'ÉNONCÉ GLOBAL */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-8">
          <h3 className="font-bold text-lg mb-3">📚 Énoncé global du problème</h3>
          <div className="mb-4 bg-white">
            <RichMathEditor
              value={contextText}
              onChange={setContextText}
            />
          </div>

          <label className="font-semibold block mb-2">
            🖼 Image de l'énoncé (optionnelle)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setContextImage(e.target.files?.[0] || null)}
            className="mb-2"
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-xs max-h-48 object-contain rounded border"
            />
          )}
        </div>

        {/* 🎯 PARTIE 2 : LES SOUS-QUESTIONS */}
        <h3 className="font-bold text-lg mb-4">🎯 Sous-questions</h3>
        <div className="space-y-6 mb-6">
          {subQuestions.map((subQ, qIndex) => (
            <div key={qIndex} className="bg-white p-5 rounded-lg border border-blue-200 shadow-sm relative">
              
              {subQuestions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSubQuestion(qIndex)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700 font-semibold"
                >
                  ❌ Supprimer
                </button>
              )}

              <h4 className="font-semibold text-blue-600 mb-4 text-lg">Question {qIndex + 1}</h4>
              
              <label className="block font-semibold mb-2">🧠 Texte de la question</label>
              <div className="mb-4">
                <RichMathEditor
                  value={subQ.questionText}
                  onChange={(val) => handleSubQuestionChange(qIndex, "questionText", val)}
                />
              </div>

              <label className="block font-semibold mb-2">💡 Explication pédagogique</label>
              <div className="mb-4">
                <RichMathEditor
                  value={subQ.explanation}
                  onChange={(val) => handleSubQuestionChange(qIndex, "explanation", val)}
                />
              </div>

              <label className="block font-semibold mb-2">Options de réponse (Remplissez au moins 2 options)</label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {subQ.options.map((opt, optIndex) => (
                  <input
                    key={optIndex}
                    type="text"
                    placeholder={`Option ${optIndex + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                ))}
              </div>

              <label className="block font-semibold mb-2">Bonne réponse</label>
              <select
                className="border p-2 rounded w-full bg-green-50"
                value={subQ.correctAnswer}
                onChange={(e) => handleSubQuestionChange(qIndex, "correctAnswer", e.target.value)}
              >
                <option value="">Sélectionnez la bonne réponse...</option>
                {subQ.options.filter(opt => opt.trim() !== "").map((opt, optIndex) => (
                  <option key={optIndex} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddSubQuestion}
          className="w-full py-3 mb-6 border-2 border-dashed border-blue-400 text-blue-600 rounded-lg hover:bg-blue-50 font-bold"
        >
          ➕ Ajouter une sous-question
        </button>

        <hr className="my-6" />

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 transition text-white font-bold px-4 py-3 rounded text-lg shadow"
        >
          ✅ Sauvegarder l'exercice complet
        </button>
      </div>

      {/* TABLEAU */}
      <table className="w-full border border-gray-300 shadow bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Énoncé du problème</th>
            <th className="border p-2">Questions</th>
            <th className="border p-2">Matière</th>
            <th className="border p-2">Chapitre</th>
          </tr>
        </thead>

        <tbody>
          {filteredExercises.map((q) => (
            <tr key={q._id} className="hover:bg-gray-50">
              <td className="border p-2">
                <div dangerouslySetInnerHTML={{ __html: q.contextText }} className="line-clamp-2" />
              </td>
              <td className="border p-2 text-center font-bold text-blue-600">
                {q.subQuestions?.length || 0}
              </td>
              <td className="border p-2 text-center">{q.subject}</td>
              <td className="border p-2 text-center">{q.chapter}</td>
            </tr>
          ))}

          {filteredExercises.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center p-6 text-gray-500">
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