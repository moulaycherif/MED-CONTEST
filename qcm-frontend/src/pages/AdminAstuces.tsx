import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

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

const AdminAstuces: React.FC = () => {
  const [tips, setTips] = useState<Tip[]>([]);

  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [cases, setCases] = useState<TipCase[]>([
    { title: "", explanation: "", example: "" },
  ]);

  // 🔹 Charger les astuces existantes
  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tips`);
      setTips(res.data);
    } catch (err) {
      console.error("Erreur chargement astuces :", err);
    }
  };

  // 🔹 Gestion des cas
  const updateCase = (index: number, field: keyof TipCase, value: string) => {
    const updated = [...cases];
    updated[index][field] = value;
    setCases(updated);
  };

  const addCase = () => {
    setCases([...cases, { title: "", explanation: "", example: "" }]);
  };

  const removeCase = (index: number) => {
    setCases(cases.filter((_, i) => i !== index));
  };

  // 🔹 Création astuce
  const createTip = async () => {
    if (!subject || !chapter || !title) {
      alert("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/tips`, {
        subject,
        chapter,
        title,
        description,
        cases,
      });

      alert("Astuce créée avec succès");
      fetchTips();

      // reset
      setSubject("");
      setChapter("");
      setTitle("");
      setDescription("");
      setCases([{ title: "", explanation: "", example: "" }]);
    } catch (err) {
      console.error("Erreur création astuce :", err);
      alert("Erreur création astuce");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        💡 Gestion des Astuces du Soutien
      </h1>

      {/* FORMULAIRE */}
      <div className="bg-white shadow rounded-xl p-6 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Matière (ex: Mathématiques)"
            className="border p-3 rounded"
          />

          <input
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="Chapitre (ex: Suites & Sommes)"
            className="border p-3 rounded"
          />
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de l’astuce"
          className="border p-3 rounded w-full mb-4"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description générale (optionnel)"
          className="border p-3 rounded w-full mb-6"
        />

        {/* CAS */}
        <h2 className="text-xl font-semibold mb-4">Cas / Astuces</h2>

        {cases.map((c, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 mb-4 bg-gray-50"
          >
            <input
              value={c.title}
              onChange={(e) =>
                updateCase(index, "title", e.target.value)
              }
              placeholder={`Titre du cas ${index + 1}`}
              className="border p-2 rounded w-full mb-2"
            />

            <textarea
              value={c.explanation}
              onChange={(e) =>
                updateCase(index, "explanation", e.target.value)
              }
              placeholder="Explication"
              className="border p-2 rounded w-full mb-2"
            />

            <textarea
              value={c.example}
              onChange={(e) =>
                updateCase(index, "example", e.target.value)
              }
              placeholder="Exemple"
              className="border p-2 rounded w-full mb-2"
            />

            {cases.length > 1 && (
              <button
                onClick={() => removeCase(index)}
                className="text-red-600 text-sm"
              >
                Supprimer ce cas
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addCase}
          className="bg-gray-200 px-4 py-2 rounded mr-4"
        >
          ➕ Ajouter un cas
        </button>

        <button
          onClick={createTip}
          className="bg-indigo-600 text-white px-6 py-2 rounded"
        >
          💾 Enregistrer l’astuce
        </button>
      </div>

      {/* LISTE ASTUCES */}
      <h2 className="text-2xl font-semibold mb-4">
        📚 Astuces existantes
      </h2>

      {tips.map((tip) => (
        <div
          key={tip._id}
          className="border rounded-lg p-4 mb-3 bg-white shadow-sm"
        >
          <div className="font-bold">
            {tip.subject} — {tip.chapter}
          </div>
          <div className="text-indigo-600">{tip.title}</div>
          <div className="text-sm text-gray-600">
            {tip.cases.length} cas
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminAstuces;
