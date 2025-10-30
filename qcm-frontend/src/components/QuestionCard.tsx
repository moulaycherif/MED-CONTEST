import React from "react";

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  exam: string;
}

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string;
  onSelect: (answer: string) => void;
}

export default function QuestionCard({ question, selectedAnswer, onSelect }: QuestionCardProps) {
  return (
    <div className="p-4 border rounded shadow">
      <p className="font-semibold mb-2">{question.questionText}</p>
      <div className="flex flex-col gap-2">
        {question.options.map((option) => (
          <button
            key={option}
            className={`px-3 py-2 border rounded text-left hover:bg-gray-100 transition 
              ${selectedAnswer === option ? "bg-blue-500 text-white" : "bg-white"}`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
