import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface QaItem {
  question: string;
  answer: string;
}

interface Props {
  qas: QaItem[];
  typingSpeed?: number; // ⬅ vitesse configurable
}

export default function AnimatedQaViewer({ qas, typingSpeed = 20 }: Props) {
  const [index, setIndex] = useState(0);
  const [typedText, setTypedText] = useState("");

  if (!qas || qas.length === 0) {
    return (
      <div className="p-4 bg-white shadow rounded-xl text-center text-gray-600">
        Aucun contenu disponible.
      </div>
    );
  }

  const current = qas[index];

  // --- Effet de typewriter ---
  useEffect(() => {
    let i = 0;
    setTypedText("");

    const interval = setInterval(() => {
      setTypedText(current.answer.slice(0, i));
      i++;

      if (i > current.answer.length) clearInterval(interval);
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [index, current.answer, typingSpeed]);

  return (
    <motion.div
      key={index} // IMPORTANT → permet l’animation entre questions
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 bg-white shadow rounded-xl"
    >
      <h3 className="font-bold text-xl mb-4 text-blue-900">
        {current.question}
      </h3>

      {/* Zone réponse avec hauteur fixe pour éviter les sauts */}
      <p className="whitespace-pre-wrap text-gray-800 min-h-[150px] leading-relaxed">
        {typedText}
      </p>

      <div className="flex justify-between mt-6">
        <button
          disabled={index === 0}
          onClick={() => setIndex((prev) => prev - 1)}
          className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50 transition active:scale-95"
        >
          ⬅ Précédent
        </button>

        <button
          disabled={index === qas.length - 1}
          onClick={() => setIndex((prev) => prev + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 transition active:scale-95"
        >
          Suivant ➡
        </button>
      </div>
    </motion.div>
  );
}
