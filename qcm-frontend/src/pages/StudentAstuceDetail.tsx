import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useParams, useNavigate } from "react-router-dom";

import "katex/dist/katex.min.css";
import katex from "katex";
import parse from "html-react-parser";

import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/* ===================== SAFE UTILS ===================== */

function safeText(text: any): string {
  if (!text || typeof text !== "string") return "";
  return text;
}

/* 🔥 Highlight + Math */
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
  } catch (err) {
    console.error("Math render error:", err);
    return <span>{safeText(html)}</span>;
  }
}

/* ===================== TYPES ===================== */

interface TipCase {
  title?: string;
  content?: string;
  explanation?: string;
  example?: string;
}

interface Tip {
  _id: string;
  subject?: string;
  chapter?: string;
  title?: string;
  description?: string;
  cases?: any[];
  pdfUrl?: string;
}

/* ===================== COMPONENT ===================== */

const StudentAstuceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);

  /* 🔥 PDF */
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);

  /* 🔥 MODE SLIDE */
  const [currentCase, setCurrentCase] = useState(0);

  useEffect(() => {
    if (id) fetchTip();
  }, [id]);

  const fetchTip = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/astuces/${id}`);

      const data = res.data;

      data.cases = Array.isArray(data.cases)
        ? data.cases.filter((c: any) => c && typeof c === "object")
        : [];

      setTip(data);
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

  const current = tip.cases?.[currentCase];

  /* ===================== RENDER ===================== */

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 underline"
      >
        ← Retour
      </button>

      {/* HEADER */}
      <div className="mb-6">
        <div className="text-sm text-gray-500">
          {safeText(tip.subject)} • {safeText(tip.chapter)}
        </div>

        <h1 className="text-3xl font-bold mt-2">
          {safeText(tip.title) || "Sans titre"}
        </h1>

        {tip.description && (
          <div className="prose mt-3">
            {renderWithMath(tip.description)}
          </div>
        )}
      </div>

      {/* ================= PDF ================= */}
      {tip.pdfUrl && (
        <div className="mb-10">

          <h2 className="text-xl font-semibold mb-4">📄 Document</h2>

          {/* CONTROLS */}
          <div className="flex gap-4 mb-4 items-center flex-wrap">
            <button onClick={() => setPageNumber(p => Math.max(p - 1, 1))}>
              ◀
            </button>

            <span>
              Page {pageNumber} / {numPages}
            </span>

            <button onClick={() => setPageNumber(p => Math.min(p + 1, numPages))}>
              ▶
            </button>

            <button onClick={() => setScale(s => s + 0.2)}>➕</button>
            <button onClick={() => setScale(s => Math.max(0.6, s - 0.2))}>➖</button>
          </div>

          {/* PDF */}
          <Document
            file={tip.pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            <Page pageNumber={pageNumber} scale={scale} />
          </Document>
        </div>
      )}

      {/* ================= MODE SLIDE ================= */}
      {current && (
        <div className="border rounded-2xl p-6 bg-white shadow-xl">

          <h2 className="text-xl font-bold mb-4">
            🔹 {current.title || `Cas ${currentCase + 1}`}
          </h2>

          {current.content && (
            <div className="prose mb-4">
              {renderWithMath(current.content)}
            </div>
          )}

          {current.explanation && (
            <div className="prose mb-4">
              {renderWithMath(current.explanation)}
            </div>
          )}

          {current.example && (
            <div className="bg-gray-100 p-4 rounded mb-4">
              <strong>Exemple :</strong>
              <div className="prose">
                {renderWithMath(current.example)}
              </div>
            </div>
          )}

          {/* 🔥 NAVIGATION SLIDE */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => {
                setCurrentCase(c => Math.max(0, c - 1));
                setPageNumber(currentCase); // sync PDF
              }}
            >
              ◀ Précédent
            </button>

            <button
              onClick={() => {
                setCurrentCase(c => Math.min((tip.cases?.length || 1) - 1, c + 1));
                setPageNumber(currentCase + 2); // sync PDF
              }}
            >
              Suivant ▶
            </button>
          </div>

          {/* 🔥 ACTIONS */}
          <div className="flex gap-4 mt-6 flex-wrap">

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setPageNumber(currentCase + 1)}
            >
              📍 Aller à la page PDF
            </button>

            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={() =>
                navigate(`/student/quiz?tip=${tip._id}&case=${currentCase}`)
              }
            >
              🧠 Tester ce cas
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default StudentAstuceDetail;