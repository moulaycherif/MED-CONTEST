import React from "react";

interface Question {
  _id: string;
  texte?: string;          // texte de la question
  image?: string;          // chemin de l’image
  options: string[];
  reponseCorrecte: string;
  subject: string;
  exam: string;
}

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string;
  onSelect: (answer: string) => void;
}

export default function QuestionCard({
  question,
  selectedAnswer,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="p-4 border rounded shadow bg-white">

      {/* 🖼️ Image de la question si elle existe */}
      {question.image && (
        <img
          src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${question.image}`}
          alt="Illustration"
          className="max-w-full max-h-[300px] mb-4 rounded shadow"
        />
      )}

      {/* 📝 Texte de la question */}
      {question.texte && (
        <p className="font-semibold mb-3">{question.texte}</p>
      )}

      {/* 🎯 Options */}
      <div className="flex flex-col gap-2">
        {question.options.map((option) => (
          <button
            key={option}
            className={`px-3 py-2 border rounded text-left transition
              ${
                selectedAnswer === option
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
