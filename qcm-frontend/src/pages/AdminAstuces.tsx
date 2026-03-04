import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import TipTapEditor from "../components/TipTapEditor";

/* ===================== TYPES ===================== */

interface TipCase {
  title: string;
  content: string; // HTML riche (TipTap)
}

interface Tip {
  _id: string;
  subject: string;
  chapter: string;
  title: string;
  description?: string;
  cases: TipCase[];
}

/* ===================== COMPONENT ===================== */

const AdminAstuces: React.FC = () => {
  const [tips, setTips] = useState<Tip[]>([]);

  // Champs principaux
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Cas
  const [cases, setCases] = useState<TipCase[]>([
    { title: "", content: "" },
  ]);

  /* ===================== FETCH ===================== */

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      console.log("API URL utilisée :", API_BASE_URL);
      const res = await axios.get(`${API_BASE_URL}/api/astuces`);
      const safeData = res.data.map((tip: any) => ({
  ...tip,
  cases: tip.cases || [],
}));

setTips(safeData);
      
} catch (err) {
      console.error("❌ Erreur chargement astuces :", err);
    }
  };

  /* ===================== CASES ===================== */

  const updateCase = (
    index: number,
    field: keyof TipCase,
    value: string
  ) => {
    const updated = [...cases];
    updated[index][field] = value;
    setCases(updated);
  };

  const addCase = () => {
    setCases([...cases, { title: "", content: "" }]);
  };

  const removeCase = (index: number) => {
    setCases(cases.filter((_, i) => i !== index));
  };

  /* ===================== CREATE ===================== */

  const createTip = async () => {
    if (!subject || !chapter || !title) {
      alert("⚠️ Matière, chapitre et titre sont obligatoires");
      return;
    }

    if (cases.some(c => !c.content.trim())) {
  alert("Chaque cas doit contenir du contenu");
  return;
}
    try {
      await axios.post(`${API_BASE_URL}/astuces`, {
        subject,
        chapter,
        title,
        description,
        cases,
      });

      alert("✅ Astuce enregistrée avec succès");
      fetchTips();

      // Reset formulaire
      setSubject("");
      setChapter("");
      setTitle("");
      setDescription("");
      setCases([{ title: "", content: "" }]);
    } catch (err) {
      console.error("❌ Erreur création astuce :", err);
      alert("Erreur lors de la création de l’astuce");
    }
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        💡 Gestion des Astuces du Soutien
      </h1>

      {/* ================= FORMULAIRE ================= */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-12">
        {/* Infos générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Matière (ex: Mathématiques)"
            className="border p-3 rounded-lg"
          />

          <input
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="Chapitre (ex: Suites & Sommes)"
            className="border p-3 rounded-lg"
          />
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre global de l’astuce"
          className="border p-3 rounded-lg w-full mb-4"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description générale (optionnelle)"
          className="border p-3 rounded-lg w-full mb-6"
        />

        {/* ================= CAS ================= */}
        <h2 className="text-xl font-semibold mb-4">
          Cas / Astuces détaillées
        </h2>

        {cases.map((c, index) => (
          <div
            key={index}
            className="border rounded-xl p-4 mb-6 bg-gray-50"
          >
            {/* Titre du cas */}
            <input
              value={c.title}
              onChange={(e) =>
                updateCase(index, "title", e.target.value)
              }
              placeholder={`Titre du cas ${index + 1}`}
              className="border p-2 rounded-lg w-full mb-3 font-semibold"
            />

            {/* Éditeur TipTap */}
            <p className="text-sm text-gray-600 mb-2">
              Contenu de l’astuce (coller depuis Word, images et équations
              supportées)
            </p>

            <div className="border rounded-lg bg-white">
              <TipTapEditor
                value={c.content}
                onChange={(html) =>
                  updateCase(index, "content", html)
                }
              />
            </div>

            {cases.length > 1 && (
              <button
                onClick={() => removeCase(index)}
                className="text-red-600 text-sm mt-3"
              >
                Supprimer ce cas
              </button>
            )}
          </div>
        ))}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={addCase}
            className="bg-gray-200 px-4 py-2 rounded-lg"
          >
            ➕ Ajouter un cas
          </button>

          <button
            onClick={createTip}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
          >
            💾 Enregistrer l’astuce
          </button>
        </div>
      </div>

      {/* ================= LISTE ================= */}
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
            {(tip.cases || []).length} cas
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminAstuces;
