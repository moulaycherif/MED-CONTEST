import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import TipTapEditor from "../components/TipTapEditor";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker?url";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const [pdfUrl, setPdfUrl] = useState("");

/* ===================== TYPES ===================== */

interface TipCase {
  title: string;
  content: string;
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

  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [cases, setCases] = useState<TipCase[]>([
    { title: "", content: "" },
  ]);

  /* ===================== CLEAN TEXT ===================== */

  const cleanText = (text: string) => {
    return text
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .replace(/e\s*ˊ/g, "é")
      .replace(/\\=/g, "=")
      .replace(/\\frac/g, "\\frac");
  };

  /* ===================== PDF → CASES ===================== */

  const processPdfText = (text: string) => {
    console.log("📄 PDF brut :", text);

    const blocks = text.split(/Cas\s*\d+/i);

    const newCases = blocks
      .filter((b) => b.trim().length > 20)
      .map((b, i) => ({
        title: `Cas ${i + 1}`,
        content: cleanText(b.trim()),
      }));

    if (newCases.length > 0) {
      setCases(newCases);
    } else {
      alert("⚠️ Aucun cas détecté dans le PDF");
    }
  };

  /* ===================== UPLOAD PDF ===================== */

  const handlePdfUpload = async (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/astuces/upload-pdf`,
      formData
    );

    setPdfUrl(res.data.url);

    alert("✅ PDF uploadé avec succès");

  } catch (err) {
    console.error("❌ Erreur upload PDF :", err);
  }
};

  /* ===================== FETCH ===================== */

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
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

    if (cases.some((c) => !c.content.trim())) {
      alert("Chaque cas doit contenir du contenu");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/astuces`, {
        subject,
        chapter,
        title,
        description,
        cases,
        pdfUrl, // ✅ AJOUT
      });

      alert("✅ Astuce enregistrée avec succès");

      fetchTips();

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

      <div className="bg-white shadow-xl rounded-2xl p-6 mb-12">

        {/* PDF */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold">
            📄 Importer un PDF d’astuces
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
            className="border p-2 rounded-lg"
          />
        </div>

        {/* Infos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Matière"
            className="border p-3 rounded-lg"
          />

          <input
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="Chapitre"
            className="border p-3 rounded-lg"
          />
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre"
          className="border p-3 rounded-lg w-full mb-4"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="border p-3 rounded-lg w-full mb-6"
        />

        {/* CAS */}
        <h2 className="text-xl font-semibold mb-4">
          Cas / Astuces
        </h2>

        {cases.map((c, index) => (
          <div key={index} className="border p-4 mb-4 rounded-lg">
            <input
              value={c.title}
              onChange={(e) =>
                updateCase(index, "title", e.target.value)
              }
              className="border p-2 w-full mb-2"
            />

            <TipTapEditor
              value={c.content}
              onChange={(html) =>
                updateCase(index, "content", html)
              }
            />

            {cases.length > 1 && (
              <button
                onClick={() => removeCase(index)}
                className="text-red-500 mt-2"
              >
                Supprimer
              </button>
            )}
          </div>
        ))}

        <button onClick={addCase} className="mr-4">
          ➕ Ajouter un cas
        </button>

        <button
          onClick={createTip}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          💾 Enregistrer
        </button>
      </div>

      {/* LISTE */}
      <h2 className="text-2xl mb-4">📚 Astuces</h2>

      {tips.map((tip) => (
        <div key={tip._id} className="border p-4 mb-2">
          <b>{tip.subject} — {tip.chapter}</b>
          <div>{tip.title}</div>
          <div>{(tip.cases || []).length} cas</div>
        </div>
      ))}
    </div>
  );
};

export default AdminAstuces;