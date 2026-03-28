import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useParams, useNavigate } from "react-router-dom";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import katex from "katex";
import parse from "html-react-parser";

<<<<<<< HEAD
console.log("StudentAstuceDetail :",useParams);

=======
>>>>>>> 7319696136728877111d34afa8ce2e09829afa27
function cleanWordText(text: string) {
  return text
    // apostrophes Word → normales
    .replace(/’/g, "'")

    // accents problématiques dans math
    .replace(/é/g, "e")
    .replace(/è/g, "e")
    .replace(/à/g, "a")

    // corriger espaces manquants
    .replace(/([a-z])([A-Z])/g, "$1 $2")

    // ajouter espaces après :
    .replace(/:/g, ": ")

    // nettoyer multiples espaces
    .replace(/\s+/g, " ")
    .trim();
}
function autoDetectLatex(text: string) {
  return text.replace(
    /(\\frac{.*?}|\\sum.*?|\\left.*?\\right.*?|[A-Za-z0-9_]+\s*=\s*[^.]+)/g,
    (match) => `$${match}$`
  );
}

function renderWithMath(html: string) {
  let text = html.replace(/<[^>]+>/g, " ");

  text = cleanWordText(text);

  text = autoDetectLatex(text); // 🔥 maintenant intelligent

  const formatted = text.replace(
    /\$(.*?)\$/g,
    (_, expr) =>
      katex.renderToString(expr, {
        throwOnError: false,
        displayMode: true,
        strict: "ignore",
      })
  );
// remplacer les spans math par KaTeX
html = html.replace(
  /<span class="math" data-latex="(.*?)"><\/span>/g,
  (_, expr) =>
    katex.renderToString(expr, {
      throwOnError: false,
      displayMode: true,
    })
);
  return parse(formatted);
}

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

const StudentAstuceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    fetchTip();
  }, []);

  const fetchTip = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tips/${id}`);
      setTip(res.data);
    } catch (err) {
      console.error("Erreur chargement astuce :", err);
    }
  };

  if (!tip) {
    return <div className="p-10 text-center">Chargement...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 underline"
      >
        ← Retour aux astuces
      </button>

      <div className="mb-6">
        <div className="text-sm text-gray-500">
          {tip.subject} • {tip.chapter}
        </div>
        <h1 className="text-3xl font-bold mt-2">{tip.title}</h1>

        {tip.description && (
          <div className="prose max-w-none mt-3">
            {renderWithMath(tip.description)}
          </div>
        )}
      </div>

      {/* CAS / ASTUCES */}
      <div className="space-y-6">
        {tip.cases.map((c, index) => (
          <div
            key={index}
            className="border rounded-xl p-5 bg-white shadow"
          >
            <h2 className="text-xl font-semibold mb-3">
              🔹 {c.title}
            </h2>

            {/* EXPLICATION */}
            <div className="prose max-w-none">
  {renderWithMath(c.explanation)}
</div>

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
              🧠 S’entraîner sur cette astuce
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentAstuceDetail;
