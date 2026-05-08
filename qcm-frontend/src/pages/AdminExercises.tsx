import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import RichMathEditor from "../components/RichMathEditor";

interface Quiz {
  _id: string;
  question: string;
  subject: string;
  chapter: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  questionImage?: string;
}

const AdminExercises: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");

  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [explanation, setExplanation] = useState("");
 
  // 🔹 Charger tous les quiz
  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/api/exercises`
    );

    const data: Quiz[] = res.data;

    setQuizzes(data);

    const uniqueSubjects = Array.from(
      new Set(data.map((q) => q.subject))
    );

    setSubjects(uniqueSubjects);

  } catch (err) {
    console.error("Erreur chargement exercices :", err);
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

  const handleSubmit = async () => {
  try {
    const adminToken = localStorage.getItem("adminToken"); // 🔥 IMPORTANT
    
    const formData = new FormData();

formData.append("subject", subject);
formData.append("chapter", chapter);
formData.append("question", question);

formData.append("options", JSON.stringify(options));

formData.append("correctAnswer", correctAnswer);

formData.append("explanation", explanation);

if (questionImage) {formData.append("questionImage", questionImage);
}

await axios.post(
  `${API_BASE_URL}/api/exercises`,
  formData,
  {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type":
        "multipart/form-data",
    },
  }
);

    alert("✅ Exercice ajouté");

   // reset
setQuestion("");
setOptions(["", "", "", "", ""]);
setCorrectAnswer("");
setSubject("");
setChapter("");
setExplanation("");
setQuestionImage(null);

    fetchExercises(); // refresh liste
  } catch (err) {
    console.error(err);
    alert("❌ Erreur ajout exercice");
  }
};

const previewUrl = React.useMemo(() => {
  if (!questionImage) return null;
  return URL.createObjectURL(questionImage);
}, [questionImage]);

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

<div className="mb-8 p-4 border rounded-lg shadow">
  <h2 className="text-xl font-bold mb-4">➕ Ajouter un exercice</h2>

  <input
    type="text"
    placeholder="Matière"
    value={subject}
    onChange={(e) => setSubject(e.target.value)}
    className="border p-2 mb-2 w-full"
  />

  <input
    type="text"
    placeholder="Chapitre"
    value={chapter}
    onChange={(e) => setChapter(e.target.value)}
    className="border p-2 mb-2 w-full"
  />

<label className="font-semibold block mb-2">
  🧠 Texte de la question
</label>

<RichMathEditor
  value={question}
  onChange={setQuestion}
/>

<label className="font-semibold block mt-4 mb-2">
  💡 Explication pédagogique (optionnelle)
</label>

<RichMathEditor
  value={explanation}
  onChange={setExplanation}
/>

<label className="font-semibold block mt-4 mb-2">
  🖼 Image de la question (optionnelle)
</label>

  <input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setQuestionImage(e.target.files?.[0] || null)
  }
/>

  {previewUrl && (
  <img
    src={previewUrl}
    alt="Preview"
    className="max-w-xs max-h-48 object-contain mt-4 rounded border"
  />
)}

  {options.map((opt, i) => (
    <input
      key={i}
      type="text"
      placeholder={`Option ${i + 1}`}
      value={opt}
      onChange={(e) => {
        const newOptions = [...options];
        newOptions[i] = e.target.value;
        setOptions(newOptions);
      }}
      className="border p-2 mb-2 w-full"
    />
  ))}

  <input
    type="text"
    placeholder="Bonne réponse"
    value={correctAnswer}
    onChange={(e) => setCorrectAnswer(e.target.value)}
    className="border p-2 mb-2 w-full"
  />

  <button
    onClick={handleSubmit}
    className="bg-green-600 text-white px-4 py-2 rounded"
  >
    Ajouter
  </button>
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
