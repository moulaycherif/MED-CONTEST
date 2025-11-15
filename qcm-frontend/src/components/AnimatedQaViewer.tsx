import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  qas: {
    question: string;
    answer: string;
  }[];
}

export default function AnimatedQaViewer({ qas }: Props) {
  const [index, setIndex] = useState(0);
  const [typedText, setTypedText] = useState("");

  const current = qas[index];

  useEffect(() => {
    let i = 0;
    setTypedText("");

    const timer = setInterval(() => {
      setTypedText(current.answer.slice(0, i));
      i++;

      if (i > current.answer.length) clearInterval(timer);
    }, 20);

    return () => clearInterval(timer);
  }, [index]);

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white shadow rounded-xl"
    >
      <h3 className="font-bold text-xl mb-4 text-blue-900">{current.question}</h3>

      <p className="whitespace-pre-wrap text-gray-800 min-h-[150px]">
        {typedText}
      </p>

      <div className="flex justify-between mt-6">
        <button
          disabled={index === 0}
          onClick={() => setIndex((prev) => prev - 1)}
          className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
        >
          ⬅ Précédent
        </button>

        <button
          disabled={index === qas.length - 1}
          onClick={() => setIndex((prev) => prev + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          Suivant ➡
        </button>
      </div>
    </motion.div>
  );
}
