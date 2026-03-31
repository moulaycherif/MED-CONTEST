import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useParams, useNavigate } from "react-router-dom";

import "katex/dist/katex.min.css";
import katex from "katex";
import parse from "html-react-parser";

/* ===================== UTILS ===================== */

function cleanWordText(text: string = "") {
  return text
    .replace(/’/g, "'")
    .replace(/é/g, "e")
    .replace(/è/g, "e")
    .replace(/à/g, "a")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/:/g, ": ")
    .replace(/\s+/g, " ")
    .trim();
}

function autoDetectLatex(text: string = "") {
  return text.replace(
    /(\\frac{.*?}|\\sum.*?|\\left.*?\\right.*?|[A-Za-z0-9_]+\s*=\s*[^.]+)/g,
    (match) => `$${match}$`
  );
}

function renderWithMath(html: string = "") {
  try {
    let text = html.replace(/<[^>]+>/g, " ");

    text = cleanWordText(text);
    text = autoDetectLatex(text);

    const formatted = text.replace(/\$(.*?)\$/g, (_, expr) =>
      katex.renderToString(expr, {
        throwOnError: false,
        displayMode: true,
        strict: "ignore",
      })
    );

    return parse(formatted);
  } catch (err) {
    console.error("Erreur rendu math :", err);
    return <span>{html}</span>;
  }
}

/* ===================== TYPES ===================== */

interface TipCase {
  title?: string;
  explanation?: string;
  example?: string;
}

interface Tip {
  _id: string;
  subject?: string;
  chapter?: string;
  title?: string;
  description?: string;
  cases?: TipCase[];
  pdfUrl?: string;
}

/* ===================== COMPONENT ===================== */

const StudentAstuceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchTip();
  }, [id]);

  const fetchTip = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/astuces/${id}`);
      setTip(res.data);
    } catch (err) {
      console.error("Erreur chargement astuce :", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== LOADING ===================== */

  if (loading) {
    return <div className="p-10 text-center">Chargement...</div>;
  }

  if (!tip) {
    return (
      <div className="p-10 text-center text-red-500">
        Astuce introuvable
      </div>
    );
  }

  /* ===================== RENDER ===================== */

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 underline"
      >
        ← Retour aux astuces
      </button>

      {/* HEADER */}
      <div className="mb-6">
        <div className="text-sm text-gray-500">
          {tip.subject || "Matière"} • {tip.chapter || "Chapitre"}
        </div>

        <h1 className="text-3xl font-bold mt-2">
          {tip.title || "Sans titre"}
        </h1>

        {tip.description && (
          <div className="prose max-w-none mt-3">
            {renderWithMath(tip.description)}
          </div>
        )}
      </div>

      {/* ================= PDF ================= */}
      {tip.pdfUrl && (
  <div className="mt-8">
    <h2 className="text-xl font-semibold mb-4">📄 Document PDF</h2>

    <iframe
      src={tip.pdfUrl}
      width="100%"
      height="600px"
      className="border rounded-xl shadow"
    />
  </div>
)}

      {/* ================= CASES ================= */}

{tip.pdfUrl && (
  <iframe src={tip.pdfUrl} width="100%" height="600px" />
)}

{(tip.cases || []).length > 0 && (
  <div className="space-y-6">
    {(tip.cases || []).filter(Boolean).map((c, index) => (
      <div key={index}>
        <h2>🔹 {c?.title || `Cas ${index + 1}`}</h2>

        {c?.explanation && renderWithMath(c.explanation)}
        {c?.example && renderWithMath(c.example)}
      </div>
    ))}
  </div>
)}       
            {Array.isArray(tip.cases) && tip.cases.length > 0 && (
  <div className="space-y-6">
    {tip.cases
      .filter((c) => c && typeof c === "object")
      .map((c, index) => (
        <div
          key={index}
          className="border rounded-xl p-5 bg-white shadow"
        >
              <h2 className="text-xl font-semibold mb-3">
                🔹 {c.title || `Cas ${index + 1}`}
              </h2>

              {/* EXPLICATION */}
              {c.explanation && (
                <div className="prose max-w-none">
                  {renderWithMath(c.explanation)}
                </div>
              )}

              {/* EXEMPLE */}
              {c.example && (
                <div className="bg-gray-100 p-4 rounded mb-4">
                  <strong>Exemple :</strong>
                  <div className="prose max-w-none">
                    {renderWithMath(c.example)}
                  </div>
                </div>
              )}

              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={() =>
                  navigate(`/student/quiz?tip=${tip._id}&case=${index}`)
                }
              >
                🧠 S’entraîner
              </button>
            </div>
          ))}
        </div>
      )}

export default StudentAstuceDetail;