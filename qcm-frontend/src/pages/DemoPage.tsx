// src/pages/DemoPage.tsx
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundWrapper from "../components/BackgroundWrapper";

// --- DONNÉES DE DÉMONSTRATION STATIQUES ---
const DEMO_CONCOURS = {
  nom: "Concours Médecine Élite - 2025",
  question: "Quelle est la valeur exacte de l'intégrale $\\int_{0}^{1} \\frac{1}{t^2-t-2} \\,\\mathrm{d}t$ ?",
  options: ["0", "\\ln(1/2)", "\\ln 2", "-\\frac{2}{3}\\ln(2)"],
};

const DEMO_MATIERE = {
  nom: "Physique Chimie",
  chapitre: "Thermodynamique",
  question: "Le premier principe de la thermodynamique énonce la conservation de :",
  options: ["L'entropie", "L'énergie totale", "L'enthalpie libre", "La température"],
};

const DEMO_SOUTIEN = {
  matiere: "Mathématiques",
  chapitre: "Chapitre I : Intégration & Primitives",
  astuce: "💡 **Astuce de Pro :** Pour intégrer une fraction rationnelle dont le dénominateur est un polynôme de degré 2, pensez toujours à vérifier s'il se factorise afin de réaliser une décomposition en éléments simples.",
  exercice: {
    enonce: "Démontrer par décomposition en éléments simples la valeur de $\\int_{0}^{1} \\frac{1}{t^2-t-2} \\,\\mathrm{d}t$.",
    solution: "Étape 1 : Factoriser $t^2-t-2 = (t-2)(t+1)$. Étape 2 : Écrire sous la forme $A/(t-2) + B/(t+1)$..."
  }
};

export default function DemoPage() {
  // Gestion de la navigation dans la démo
  const [activeTab, setActiveTab] = useState<"concours" | "matiere" | "soutien">("concours");

  return (
    <BackgroundWrapper>
      <Navbar />
      <main className="flex flex-col min-h-screen items-center pt-24 pb-12 px-6 bg-white">
        
        {/* En-tête de la Démo */}
        <div className="text-center max-w-2xl mb-10">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold uppercase tracking-wider">
            👀 Mode Invité / Démonstration
          </span>
          <h1 className="text-4xl font-bold text-blue-700 mt-3 mb-2">
            Aperçu de l'Application
          </h1>
          <p className="text-gray-600">
            Découvrez l'interface de MED-CONTEST. Pour accéder à l'intégralité des fonctionnalités et répondre aux questions, activez votre abonnement.
          </p>
        </div>

        {/* Onglets de navigation (Tabs) */}
        <div className="flex gap-4 mb-8 bg-gray-100 p-1.5 rounded-xl shadow-inner">
          <button
            onClick={() => setActiveTab("concours")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === "concours" ? "bg-white text-blue-700 shadow" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🏆 QCM par Concours
          </button>
          <button
            onClick={() => setActiveTab("matiere")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === "matiere" ? "bg-white text-blue-700 shadow" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📚 QCM par Matière
          </button>
          <button
            onClick={() => setActiveTab("soutien")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === "soutien" ? "bg-white text-blue-700 shadow" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🧠 Espace Soutien
          </button>
        </div>

        {/* Zone de contenu verrouillée (pointer-events-none empêche les clics) */}
        <div className="w-full max-w-3xl bg-gray-50 border border-gray-200 rounded-2xl p-8 relative overflow-hidden shadow-md">
          
          {/* Filigrane d'interdiction global */}
          <div className="absolute top-4 right-4 z-10 bg-red-100 text-red-700 font-bold text-xs px-3 py-1 rounded-full border border-red-200">
            🔒 Vue bloquée (Mode Démo)
          </div>

          <div className="pointer-events-none opacity-85 select-none">
            
            {/* CONTENU 1 : QCM PAR CONCOURS */}
            {activeTab === "concours" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{DEMO_CONCOURS.nom}</h2>
                <div className="h-1 w-20 bg-blue-600 mb-6 rounded-full"></div>
                <p className="text-lg font-medium text-gray-700 mb-4">{DEMO_CONCOURS.question}</p>
                <div className="space-y-3">
                  {DEMO_CONCOURS.options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl cursor-not-allowed">
                      <input type="radio" name="demo-concours" disabled className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-600">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* CONTENU 2 : QCM PAR MATIÈRE */}
            {activeTab === "matiere" && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded">
                    {DEMO_MATIERE.nom}
                  </span>
                  <span className="text-gray-400">/</span>
                  <span className="text-sm text-gray-600 font-medium">{DEMO_MATIERE.chapitre}</span>
                </div>
                <div className="h-1 w-20 bg-indigo-600 mb-6 rounded-full"></div>
                <p className="text-lg font-medium text-gray-700 mb-4">{DEMO_MATIERE.question}</p>
                <div className="space-y-3">
                  {DEMO_MATIERE.options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl cursor-not-allowed">
                      <input type="radio" name="demo-matiere" disabled className="h-4 w-4 text-indigo-600" />
                      <span className="text-gray-600">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* CONTENU 3 : ESPACE SOUTIEN (Mathématiques, Chapitre 1, Astuce, Exercice) */}
            {activeTab === "soutien" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800">{DEMO_SOUTIEN.matiere}</h2>
                <p className="text-sm text-gray-500 mb-4">{DEMO_SOUTIEN.chapitre}</p>
                <div className="h-1 w-20 bg-emerald-600 mb-6 rounded-full"></div>

                {/* Bloc Astuce */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6">
                  <p className="text-amber-900 text-sm leading-relaxed">{DEMO_SOUTIEN.astuce}</p>
                </div>

                {/* Bloc Exercice */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">✍️ Exercice d'application</span>
                  <p className="text-gray-800 font-medium mb-3">{DEMO_SOUTIEN.exercice.enonce}</p>
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-1">📖 Extrait Corrigé</span>
                    <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {DEMO_SOUTIEN.exercice.solution}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Bouton d'action incitatif pour l'abonnement */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 text-center sm:text-left">
              Pour débloquer ce contenu et s'entraîner en conditions réelles :
            </p>
            <a 
              href="/abonnement" 
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-102 text-sm text-center"
            >
              🚀 Activer mon accès complet
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </BackgroundWrapper>
  );
}