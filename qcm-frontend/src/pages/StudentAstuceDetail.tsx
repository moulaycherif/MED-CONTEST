import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useParams, useNavigate } from "react-router-dom";

import "katex/dist/katex.min.css";
import katex from "katex";
import parse from "html-react-parser";

import { Document, Page, pdfjs } from "react-pdf";


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

  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);

  const [currentCase, setCurrentCase] = useState(0);

  useEffect(() => {
  const el = document.getElementById(`page_${pageNumber}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}, [pageNumber]);

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

          {/* 🔥 TOOLBAR PREMIUM */}
<div className="sticky top-0 z-10 bg-white border p-3 rounded-lg shadow flex flex-wrap gap-4 items-center justify-between">

  {/* Navigation */}
  <div className="flex items-center gap-2">
    <button onClick={() => setPageNumber(p => Math.max(p - 1, 1))}>◀</button>

    <span className="text-sm font-medium">
      Page {pageNumber} / {numPages}
    </span>

    <button onClick={() => setPageNumber(p => Math.min(p + 1, numPages))}>▶</button>
  </div>

  {/* Zoom */}
  <div className="flex items-center gap-2">
    <button onClick={() => setScale(s => s + 0.2)}>➕</button>
    <button onClick={() => setScale(s => Math.max(0.6, s - 0.2))}>➖</button>
  </div>

  {/* Scroll direct */}
  <div className="flex items-center gap-2">
    <input
      type="number"
      min={1}
      max={numPages}
      value={pageNumber}
      onChange={(e) => setPageNumber(Number(e.target.value))}
      className="w-16 border px-2 py-1 rounded"
    />
    <span className="text-sm">Go</span>
  </div>

</div>
          <Document
  file={{
    url: tip.pdfUrl,
    withCredentials: false,
  }}
  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
  onLoadError={(err) => console.error("❌ PDF ERROR:", err)}
  //options={{
//    cMapUrl: "https://unpkg.com/pdfjs-dist/cmaps/",
    //cMapPacked: true,
  //}}
>
 {Array.from(new Array(numPages), (_, i) => (
  <div id={`page_${i + 1}`} key={i}>
  <Page
    pageNumber={i + 1}
    scale={scale}
    renderTextLayer={false}
    renderAnnotationLayer={false}
  />
</div>
))}
</Document>
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
    className="mt-4 rounded-lg shadow max-h-[400px] object-contain"
  />
)}

          <div className="flex justify-between mt-6">

            <button
              onClick={() => {
                setCurrentCase(c => Math.max(0, c - 1));
                setPageNumber(currentCase);
              }}
            >
              ◀
            </button>

            <button
              onClick={() => {
                setCurrentCase(c => Math.min((tip.cases?.length || 1) - 1, c + 1));
                setPageNumber(currentCase + 2);
              }}
            >
              ▶
            </button>
          </div>

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