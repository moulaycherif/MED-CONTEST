import React, { useState } from "react";
import { motion } from "framer-motion";

interface TipCase {
  title: string;
  content: string;
}

interface Astuce {
  title: string;
  cases: TipCase[];
}

const AnimatedQaViewer: React.FC<{ qas: Astuce[] }> = ({ qas }) => {
  const [astuceIndex, setAstuceIndex] = useState(0);
  const [caseIndex, setCaseIndex] = useState(0);

  if (!qas || qas.length === 0) {
    return (
      <p className="text-center text-gray-500">
        Aucune astuce disponible
      </p>
    );
  }

  const currentAstuce = qas[astuceIndex];
  const currentCase = currentAstuce.cases[caseIndex];

  const next = () => {
    if (caseIndex < currentAstuce.cases.length - 1) {
      setCaseIndex(caseIndex + 1);
    } else if (astuceIndex < qas.length - 1) {
      setAstuceIndex(astuceIndex + 1);
      setCaseIndex(0);
    }
  };

  const prev = () => {
    if (caseIndex > 0) {
      setCaseIndex(caseIndex - 1);
    } else if (astuceIndex > 0) {
      const prevAstuce = qas[astuceIndex - 1];
      setAstuceIndex(astuceIndex - 1);
      setCaseIndex(prevAstuce.cases.length - 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">

      {/* 🔷 Titre de l’astuce */}
      <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700">
        {currentAstuce.title}
      </h2>

      {/* 🧠 Carte animée */}
      <motion.div
        key={`${astuceIndex}-${caseIndex}`}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-2xl shadow-lg"
      >
        {/* 🔹 Titre du cas */}
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          🔹 {currentCase.title}
        </h3>

        {/* 📄 Contenu HTML */}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: currentCase.content }}
        />
      </motion.div>

      {/* 🔘 Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prev}
          disabled={astuceIndex === 0 && caseIndex === 0}
          className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
        >
          ⬅️ Précédent
        </button>

        <button
          onClick={next}
          disabled={
            astuceIndex === qas.length - 1 &&
            caseIndex === currentAstuce.cases.length - 1
          }
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
        >
          Suivant ➡️
        </button>
      </div>

      {/* 🔢 Indicateur */}
      <div className="text-center mt-4 text-sm text-gray-500">
        Astuce {astuceIndex + 1}/{qas.length} — Cas {caseIndex + 1}/
        {currentAstuce.cases.length}
      </div>
    </div>
  );
};

export default AnimatedQaViewer;