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

function renderWithMath(html: any) {
  try {
    const safeHtml = safeText(html);

    const formatted = safeHtml.replace(/\$(.*?)\$/g, (_, expr) =>
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
  content?: string; // ⚠️ IMPORTANT : backend utilise content
  explanation?: string;
  example?: string;
}

interface Tip {
  _id: string;
  subject?: string;
  chapter?: string;
  title?: string;
  description?: string;
  cases?: any;
  pdfUrl?: string;
}

/* ===================== COMPONENT ===================== */

const StudentAstuceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);

  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    if (id) fetchTip();
  }, [id]);

  const fetchTip = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/astuces/${id}`);

      const data = res.data;

      // 🔥 NORMALISATION ULTRA IMPORTANTE
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

  /* ===================== RENDER ===================== */

  return (
    <div className="p-8 max-w-4xl mx-auto">
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
      {tip.pdfUrl && numPages > 0 && (
  <Document
    file={tip.pdfUrl}
    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
  >
    {Array.from(new Array(numPages), (_, i) => (
      <Page key={i} pageNumber={i + 1} width={800} />
    ))}
  </Document>
)}

      {/* ================= CASES ================= */}

      {Array.isArray(tip.cases) && tip.cases.length > 0 && (
        <div className="space-y-6">
          {tip.cases.map((c: TipCase, index: number) => {
            if (!c || typeof c !== "object") return null;

            return (
              <div
                key={index}
                className="border rounded-xl p-5 bg-white shadow"
              >
                <h2 className="text-xl font-semibold mb-3">
                  🔹 {c.title || `Cas ${index + 1}`}
                </h2>

                {/* CONTENU */}
                {c.content && (
                  <div className="prose">
                    {renderWithMath(c.content)}
                  </div>
                )}

                {/* EXPLANATION (fallback ancien format) */}
                {c.explanation && (
                  <div className="prose">
                    {renderWithMath(c.explanation)}
                  </div>
                )}

                {/* EXEMPLE */}
                {c.example && (
                  <div className="bg-gray-100 p-4 rounded mt-4">
                    <strong>Exemple :</strong>
                    <div className="prose">
                      {renderWithMath(c.example)}
                    </div>
                  </div>
                )}

                <button
                  className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
                  onClick={() =>
                    navigate(`/student/quiz?tip=${tip._id}&case=${index}`)
                  }
                >
                  🧠 S’entraîner
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentAstuceDetail;