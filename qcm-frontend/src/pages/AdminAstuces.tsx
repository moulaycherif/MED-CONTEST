import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import TipTapEditor from "../components/TipTapEditor";

/* ===================== TYPES ===================== */

interface TipCase {
  title?: string;
  content?: string;
  explanation?: string;
  example?: string;
  image?: string; // 🔥 AJOUT
}

interface Tip {
  _id: string;
  subject: string;
  chapter: string;
  title: string;
  description?: string;
  cases: TipCase[];
  pdfUrl?: string;
}

/* ===================== COMPONENT ===================== */

const AdminAstuces: React.FC = () => {
  /* 🔥 MODE */
  const [mode, setMode] = useState<"pdf" | "manual">("pdf");

  /* 🔥 PDF */
  const [pdfUrl, setPdfUrl] = useState("");

  /* 🔥 DATA */
  const [tips, setTips] = useState<Tip[]>([]);

  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [cases, setCases] = useState<TipCase[]>([
    { title: "", content: "" },
  ]);

  /* ===================== RESET MODE ===================== */

  useEffect(() => {
    if (mode === "pdf") {
      setCases([{ title: "", content: "" }]);
    }
    if (mode === "manual") {
      setPdfUrl("");
    }
  }, [mode]);

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

  /* ===================== PDF UPLOAD ===================== */

  const handlePdfUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      
      const res = await axios.post(
        `${API_BASE_URL}/api/astuces/upload-pdf`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setPdfUrl(res.data.pdfUrl);

      alert("✅ PDF uploadé avec succès !");
    } catch (err) {
      console.error("❌ Erreur upload PDF :", err);
      alert("Erreur upload PDF");
    }
  };

  const handleImageUpload = async (e: any, index: number) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/astuces/upload-image`,
      formData
    );

    updateCase(index, "image", res.data.imageUrl);

  } catch (err) {
    console.error("❌ upload image:", err);
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

    if (mode === "pdf" && !pdfUrl) {
      alert("⚠️ Veuillez uploader un PDF");
      return;
    }

    if (
  mode === "manual" &&
  cases.some((c) => !c.content?.trim() && !c.image)
) {
  alert("⚠️ Chaque cas doit avoir du texte ou une image");
  return;
}

    try {
      const cleanCases = cases.filter(
  (c) =>
    (c.content && c.content.trim() !== "") ||
    (c.image && c.image !== "")
);
      await axios.post(`${API_BASE_URL}/api/astuces`, {
        subject,
        chapter,
        title,
        description,
        cases: pdfUrl ? [] : cleanCases, // 🔥 IMPORTANT
        pdfUrl,
        //cases: mode === "manual" ? cases : [],
        //pdfUrl: mode === "pdf" ? pdfUrl : null,
      });

      alert("✅ Astuce enregistrée avec succès");

      fetchTips();

      /* RESET */
      setSubject("");
      setChapter("");
      setTitle("");
      setDescription("");
      setCases([{ title: "", content: "" }]);
      setPdfUrl("");
    } catch (err) {
      console.error("❌ Erreur création astuce :", err);
      alert("Erreur lors de la création");
    }
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        💡 Gestion des Astuces du Soutien
      </h1>

      <div className="bg-white shadow-xl rounded-2xl p-6 mb-12">

        {/* 🔥 MODE SWITCH */}
        <div className="mb-6">
          <button
            onClick={() => setMode("pdf")}
            className={`mr-2 px-4 py-2 rounded ${
              mode === "pdf" ? "bg-indigo-600 text-white" : "bg-gray-200"
            }`}
          >
            📄 PDF
          </button>

          <button
            onClick={() => setMode("manual")}
            className={`px-4 py-2 rounded ${
              mode === "manual" ? "bg-indigo-600 text-white" : "bg-gray-200"
            }`}
          >
            ✍️ Manuel
          </button>
        </div>

        {/* ================= PDF ================= */}
        {mode === "pdf" && (
          <div className="mb-6">
            <label className="block mb-2 font-semibold">
              📄 Importer un PDF
            </label>

            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              className="border p-2 rounded-lg"
            />

            {pdfUrl && (
              <p className="text-green-600 mt-2">
                ✅ PDF prêt à être enregistré
              </p>
            )}
          </div>
        )}

        {/* ================= INFOS ================= */}
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

        {/* ================= MANUAL ================= */}
        {mode === "manual" && (
          <>
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

                <input
  type="file"
  accept="image/*"
  onChange={(e) => handleImageUpload(e, index)}
/>

{c.image && (
  <img src={c.image} className="mt-2 rounded max-h-40" />
)}

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
          </>
        )}

        {/* ================= SAVE ================= */}
        <button
          onClick={createTip}
          className="bg-indigo-600 text-white px-4 py-2 rounded mt-6"
        >
          💾 Enregistrer
        </button>
      </div>

      {/* ================= LIST ================= */}
      <h2 className="text-2xl mb-4">📚 Astuces</h2>

<div className="grid md:grid-cols-2 gap-4">
  console.log("📦 DATA DB:", tips);
  {tips.map((tip) => {
    const hasPDF = !!tip.pdfUrl;
    const hasImage = tip.cases?.some((c) => c.image);
    const hasText = tip.cases?.some((c) => c.content);

    return (
      <div
        key={tip._id}
        className="border p-4 rounded-xl shadow hover:shadow-lg transition"
      >
        <div className="text-sm text-gray-500">
          {tip.subject} — {tip.chapter}
        </div>

        <h3 className="font-bold text-lg">{tip.title}</h3>

        {/* 🔥 TYPE BADGE */}
        <div className="mt-2">
          {hasPDF && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
              📄 PDF
            </span>
          )}

          {!hasPDF && hasImage && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">
              🖼️ Image
            </span>
          )}

          {!hasPDF && !hasImage && hasText && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
              ✍️ Texte
            </span>
          )}
        </div>

        {/* 🔥 PREVIEW PDF */}
        {hasPDF && (
          <div className="mt-3 text-sm text-gray-600">
            📄 Astuce en format PDF
          </div>
        )}

        {/* 🔥 PREVIEW IMAGE */}
        {!hasPDF && hasImage && (
          <img
            src={tip.cases.find((c) => c.image)?.image}
            className="mt-3 rounded-lg max-h-40 object-cover w-full"
          />
        )}

        {/* 🔥 PREVIEW TEXTE */}
        {!hasPDF && !hasImage && hasText && (
          <div
            className="mt-3 text-gray-700 line-clamp-3 text-sm"
            dangerouslySetInnerHTML={{
              __html: tip.cases[0]?.content || "",
            }}
          />
        )}
      </div>
    );
  })}
</div>
    </div>
  );
};

export default AdminAstuces;