import React from "react";

interface Question {
  _id: string;
  texte?: string;
  image?: string | null;
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
    <div className="p-4 border rounded shadow space-y-3">

      {/* 🖼️ IMAGE */}
      {question.image && (
        <img
          src={`http://localhost:5000${question.image}`}
          alt="Question"
          className="max-w-lg rounded shadow"
        />
      )}

      {/* 📝 TEXTE */}
      {question.texte && (
        <p className="font-semibold">{question.texte}</p>
      )}

      {/* OPTIONS */}
      <div className="flex flex-col gap-2">
        {question.options.map((option) => (
          <button
            key={option}
            className={`px-3 py-2 border rounded text-left transition
              ${
                selectedAnswer === option
                  ? "bg-blue-500 text-white"
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
