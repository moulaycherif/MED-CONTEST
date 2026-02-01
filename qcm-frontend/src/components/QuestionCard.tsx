import React from "react";

import { API_BASE_URL } from "../config";

console.log("🔥🔥🔥 QuestionCard LOADED 🔥🔥🔥");


interface Question {
  _id: string;
  texte?: string;
  image?: string | null;

  groupId?: {
    _id: string;
    image?: string | null;
  } | null;

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
  
const image = question.groupId?.image || question.image;

  return (
    <div className="p-4 border rounded shadow space-y-3">
    
      {/* 🖼 IMAGE */}
      {image && (
        <img
          src={`${API_BASE_URL}${image}`}
          className="max-w-lg rounded shadow"
          alt="Énoncé"
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
            className={`px-3 py-2 border rounded text-left hover:bg-gray-100 
              ${selectedAnswer === option ? "bg-blue-500 text-white" : ""}`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>

    </div>
  );
}
