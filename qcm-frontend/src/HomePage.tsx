import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-12">QCM-MEDECINE</h1>
      
      <div className="flex gap-8">
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
          onClick={() => navigate("/student")}
        >
          🎓 Étudiant
        </button>
        <button
          className="px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
          onClick={() => navigate("/teacher")}
        >
          🧑‍🏫 Enseignant
        </button>
        <button
          className="px-6 py-3 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600"
          onClick={() => navigate("/stats")}
        >
          📊 Statistiques
        </button>
        <button
          className="px-6 py-3 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
          onClick={() => navigate("/")}
        >
          🚪 Déconnexion
        </button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
        Test Tailwind
        </button>

      </div>
    </main>
  );
}
