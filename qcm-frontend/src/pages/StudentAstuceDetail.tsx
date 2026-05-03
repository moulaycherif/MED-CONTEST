import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useParams, useNavigate } from "react-router-dom";

import "katex/dist/katex.min.css";
import katex from "katex";
import parse from "html-react-parser";


/* ================= SAFE ================= */

function safeText(text: any): string {
  return typeof text === "string" ? text : "";
}

/* 🔥 Math + Highlight */
function renderWithMath(html: any) {
  try {
    const safeHtml = safeText(html);

    const highlighted = safeHtml.replace(/\$(.*?)\$/g, (match) => {
      return `<span style="background:#fff3cd;padding:2px 6px;border-radius:6px;">${match}</span>`;
    });

    const formatted = highlighted.replace(/\$(.*?)\$/g, (_, expr) =>
      katex.renderToString(expr, {
        throwOnError: false,
        displayMode: true,
      })
    );

    return parse(formatted);
  } catch {
    return <span>{safeText(html)}</span>;
  }
}

/* ================= TYPES ================= */

interface TipCase {
  title?: string;
  content?: string;
  explanation?: string;
  example?: string;
  image?: string; // 🔥 AJOUT
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

/* ================= COMPONENT ================= */

const StudentAstuceDetail = ({ id, onBack }: any) => {

  if (!id) return <div>Astuce introuvable</div>;
  
  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentCase, setCurrentCase] = useState(0);

  useEffect(() => {
    if (id) fetchTip();
  }, [id]);

  const fetchTip = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/astuces/detail/${id}`);
      const data = res.data;

      data.cases = Array.isArray(data.cases)
        ? data.cases.filter(Boolean)
        : [];

      setTip(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;
  if (!tip) return <div className="p-10 text-red-500">Introuvable</div>;

  const current = tip.cases?.[currentCase];

  return (
    <div className="p-8 max-w-6xl mx-auto">

      <button onClick={onBack} className="mb-4 text-blue-600">
        ← Retour
      </button>

      <h1 className="text-3xl font-bold">{safeText(tip.title)}</h1>

      {/* 🔥 PDF */}
      {tip.pdfUrl && (
        <div className="mt-6">

  {/* Zoom */}
  <div className="absolute top-4 right-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"> ZOOM
    <button onClick={() => setScale(s => s + 0.2)}>➕</button>
    <button onClick={() => setScale(s => Math.max(0.6, s - 0.2))}>➖</button>
  </div>

  
  {/* 🔥 PDF */}
{tip.pdfUrl && (
  <div className="mt-6">
    <iframe
      src={tip.pdfUrl}
      className="w-full h-[800px] rounded-xl shadow"
      style={{ border: "none" }}
    />
  </div>
)}
         </div>
      )}

      {/* 🔥 SLIDE */}
      {current && (
        <div className="mt-10 bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-bold mb-4">
            {current.title || `Cas ${currentCase + 1}`}
          </h2>

          {current.content && (
            <div className="prose">{renderWithMath(current.content)}</div>
          )}

          {current.example && (
            <div className="bg-gray-100 p-3 mt-4 rounded">
              {renderWithMath(current.example)}
            </div>
          )}

          {current.image && (
  <img
    src={current.image}
    alt="astuce"
    loading="lazy"
    className="max-h-24 object-contain"
  />
)}

          <button
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            onClick={() =>
  window.location.href = `/student/quiz/${tip._id}?case=${currentCase}`
}
          >
            🧠 Quiz
          </button>

        </div>
      )}
    </div>
  );
};

export default StudentAstuceDetail;