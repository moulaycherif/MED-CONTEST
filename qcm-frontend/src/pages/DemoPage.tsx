// src/pages/DemoPage.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { Link } from "react-router-dom";

// --- DONNÉES DE DÉMONSTRATION STATIQUES ---
const DEMO_CONCOURS = {
  titre: "Concours Blanc - Session Principale",
  matiere: "Mathématiques (Intégrales)",
  question: "Question 1 : L'intégrale $\\int_{0}^{1}\\frac{1}{t^{2}-t-2} \\mathrm{d}t$ vaut :",
  options: [
    { label: "A", texte: "0" },
    { label: "B", texte: "$\\ln(1/2)$" },
    { label: "C", texte: "$\\ln 2$" },
    { label: "D", texte: "$-\\frac{2}{3}\\ln(2)$" }
  ]
};

const DEMO_MATIERE = {
  nom: "Physique - Chimie",
  chapitre: "Thermodynamique",
  question: "Le premier principe de la thermodynamique énonce la conservation de :",
  options: [
    { label: "A", texte: "L'entropie globale" },
    { label: "B", texte: "L'énergie totale du système isolé" },
    { label: "C", texte: "L'enthalpie libre" },
    { label: "D", texte: "La température absolue" }
  ]
};

const DEMO_SOUTIEN = {
  matiere: "Mathématiques",
  chapitre: "Chapitre I : Intégration & Primitives",
  astuce: "💡 **Astuce de l'enseignant :** Lorsque vous rencontrez une fraction rationnelle du type $\\frac{1}{at^2+bt+c}$, calculez d'abord le discriminant $\\Delta$. S'il est positif, factorisez le dénominateur pour décomposer la fraction en éléments simples.",
  exercice: {
    enonce: "Calculer la valeur exacte de l'intégrale $\\int_{0}^{1}\\frac{1}{t^{2}-t-2} \\mathrm{d}t$ en détaillant les étapes de décomposition.",
    solution: "1) Factorisation : $t^2-t-2 = (t-2)(t+1)$. 2) Décomposition : $\\frac{1}{t^2-t-2} = \\frac{1}{3(t-2)} - \\frac{1}{3(t+1)}$. 3) Intégration : $[\\frac{1}{3}\\ln|\\frac{t-2}{t+1}|]_0^1 = \\frac{2}{3}\\ln(1/2)$."
  }
};

export default function DemoPage() {
  // Navigation interne de la visite guidée
  const [activePart, setActivePart] = useState<"concours" | "matiere" | "soutien">("concours");

  return (
    <BackgroundWrapper>
      <Navbar />
      {/* Modification vers le fond blanc et gestion de l'alignement */}
      <main className="flex flex-col min-h-screen items-center pt-24 pb-12 px-6 bg-white text-center">
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl font-bold text-blue-700 mb-4"
        >
          🚀 Essayez Med-Contest gratuitement
        </motion.h1>
        
        <p className="text-gray-500 max-w-2xl mb-8 text-sm">
          Découvrez l'interface de notre plateforme à travers cette visite guidée. Pour interagir avec les QCM et accéder à l'ensemble des exercices corrigés, l'activation d'un abonnement est requise.
        </p>

        {/* --- ONGLETS DE SÉLECTION DE LA VISITE --- */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 bg-gray-50 p-2 rounded-2xl border border-gray-100 shadow-sm w-full max-w-3xl">
          <button
            onClick={() => setActivePart("concours")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
              activePart === "concours" 
                ? "bg-blue-600 text-white shadow-lg" 
                : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
            }`}
          >
            🏆 QCE par Concours
          </button>
          
          <button
            onClick={() => setActivePart("matiere")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
              activePart === "matiere" 
                ? "bg-blue-600 text-white shadow-lg" 
                : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
            }`}
          >
            📚 QCE par Matière
          </button>
          
          <button
            onClick={() => setActivePart("soutien")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
              activePart === "soutien" 
                ? "bg-blue-600 text-white shadow-lg" 
                : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
            }`}
          >
            💡 Espace Soutien
          </button>
        </div>

        {/* --- ZONE D'AFFICHAGE REPRÉSENTATIVE DE L'INTERFACE (BLOCÉE) --- */}
        <div className="w-full max-w-3xl bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl text-left">
          
          {/* Badge de notification du Mode Démo */}
          <div className="absolute top-4 right-4 z-10 bg-red-50 text-red-600 font-bold text-xs px-3 py-1 rounded-full border border-red-200">
            🔒 Aperçu Invité
          </div>

          {/* Conteneur désactivé pour empêcher les réponses ou la sélection */}
          <div className="pointer-events-none opacity-90 select-none">
            
            {/* PARTIE 1 : RENDU QCE PAR CONCOURS */}
            {activePart === "concours" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-4">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md uppercase">
                    {DEMO_CONCOURS.matiere}
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-800 mt-2">{DEMO_CONCOURS.titre}</h2>
                </div>
                <div className="h-px bg-slate-200 my-4" />
                
                <p className="text-base font-medium text-slate-700 bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-4">
                  {DEMO_CONCOURS.question}
                </p>
                
                <div className="space-y-2.5">
                  {DEMO_CONCOURS.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-xl">
                      <input 
                        type="radio" 
                        name="demo-qcm-concours" 
                        disabled 
                        className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-0 cursor-not-allowed" 
                      />
                      <span className="font-bold text-slate-400 text-sm w-4">{opt.label}.</span>
                      <span className="text-slate-600 text-sm">{opt.texte}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PARTIE 2 : RENDU QCE PAR MATIÈRE */}
            {activePart === "matiere" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-4">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md uppercase">
                    Matière : {DEMO_MATIERE.nom}
                  </span>
                  <h2 className="text-lg font-bold text-slate-500 mt-2">Chapitre : {DEMO_MATIERE.chapitre}</h2>
                </div>
                <div className="h-px bg-slate-200 my-4" />
                
                <p className="text-base font-medium text-slate-700 bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-4">
                  {DEMO_MATIERE.question}
                </p>
                
                <div className="space-y-2.5">
                  {DEMO_MATIERE.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-xl">
                      <input 
                        type="radio" 
                        name="demo-qcm-matiere" 
                        disabled 
                        className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-0 cursor-not-allowed" 
                      />
                      <span className="font-bold text-slate-400 text-sm w-4">{opt.label}.</span>
                      <span className="text-slate-600 text-sm">{opt.texte}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PARTIE 3 : RENDU ESPACE SOUTIEN */}
            {activePart === "soutien" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md uppercase">
                    Soutien : {DEMO_SOUTIEN.matiere}
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-800 mt-2">{DEMO_SOUTIEN.chapitre}</h2>
                </div>
                <div className="h-px bg-slate-200" />

                {/* Bloc Astuce */}
                <div className="bg-amber-50/70 border-l-4 border-amber-500 p-4 rounded-r-xl">
                  <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider block mb-1">💡 Méthode & Astuce</span>
                  <p className="text-amber-900 text-sm leading-relaxed">{DEMO_SOUTIEN.astuce}</p>
                </div>

                {/* Bloc Exercice d'application */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider inline-block mb-3">
                    📝 Exercice d'entraînement
                  </span>
                  <p className="text-slate-800 font-medium text-sm mb-4">{DEMO_SOUTIEN.exercice.enonce}</p>
                  
                  {/* Extrait de corrigé type */}
                  <div className="pt-4 border-t border-dashed border-slate-200">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Solution attendue :</span>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic font-mono">
                      {DEMO_SOUTIEN.exercice.solution}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          {/* --- PIED DE LA VISITE (BOUTON DE CONVERSION EN ABONNÉ) --- */}
          {/* Ce bloc est actif (en dehors de pointer-events-none) */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold text-slate-700">Prêt à booster vos révisions ?</p>
              <p className="text-xs text-slate-400">Débloquez des milliers de questions et de corrections détaillées.</p>
            </div>
            <Link 
              to="/abonnement" 
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 text-center whitespace-nowrap"
            >
              🚀 S'abonner maintenant
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </BackgroundWrapper>
  );
}