// src/pages/AstucePage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const ASTUCES: Record<string, string[]> = {
  math: [
    "Les suites",
    "La probabilité",
    "L'étude de fonctions",
    "Les limites",
    "Les équations différentielles",
    "L'espace vectoriel",
    "Les nombres complexes",
  ],
  physique: [
    "Cinématique",
    "Dynamique",
    "Travail et énergie",
    "Électricité",
    "Optique",
    "Thermodynamique",
  ],
  chimie: [
    "Structure de la matière",
    "Liaisons chimiques",
    "Réactions chimiques",
    "Équilibres acide-base",
    "Cinétique chimique",
  ],
  svt: [
    "Génétique",
    "Métabolisme cellulaire",
    "Écologie",
    "Immunologie",
    "Évolution et diversité",
  ],
};

export default function AstucePage() {
  const { matiere } = useParams();
  const navigate = useNavigate();
  const chapitres = ASTUCES[matiere || ""] || [];

  const titre =
    matiere === "math"
      ? "Mathématiques"
      : matiere === "physique"
      ? "Physique"
      : matiere === "chimie"
      ? "Chimie"
      : "SVT";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50 p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
      >
        🔙 Retour
      </button>

      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">
        💡 {titre}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {chapitres.map((ch, i) => (
          <button
            key={i}
            className="bg-white border shadow rounded-xl p-4 text-center font-semibold hover:bg-indigo-50 transition"
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  );
}
