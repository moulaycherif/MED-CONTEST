import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import concoursImg from "../assets/CONCOURS.jfif";
import mathsImg from "../assets/MATHS.jfif";
import physiqueImg from "../assets/PHYSIQUE.jfif";
import chimieImg from "../assets/CHIMIE.jfif";
import svtImg from "../assets/SVT.jfif";
import bgImage from "/Image3.jfif";

export default function StudentPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState<"concours" | "matiere" | "soutien" | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<string | null>(null);

  const matieres = ["Mathématiques", "Physique", "Chimie", "SVT"];

  const handleExamClick = async (exam: string) => {
    navigate(`/exam/${exam}`); // 🔹 Redirige vers la page du concours sélectionné
  };

  // --- Fonction centrale pour afficher le contenu
  const renderCenterContent = () => {
    // 🏆 Section Concours
    if (section === "concours") {
      const annees = ["2025", "2024", "2023", "2022"];

      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-6 justify-start items-start"
        >
          {annees.map((year) => (
            <motion.div
              key={year}
              whileHover={{ scale: 1.05 }}
              className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/90 hover:bg-white transition-all"
              onClick={() => handleExamClick(year)}
            >
              <img src={concoursImg} alt={`Concours ${year}`} className="w-48 h-48 object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center py-2 font-semibold">
                Concours {year}
              </div>
            </motion.div>
          ))}
        </motion.div>
      );
    }

    // 📚 Section Matière
    if (section === "matiere" && selectedMatiere) {
      const matiereImages: Record<string, string> = {
        Mathématiques: mathsImg,
        Physique: physiqueImg,
        Chimie: chimieImg,
        SVT: svtImg,
      };
      const matiereImage = matiereImages[selectedMatiere];
      const annees = ["2025", "2024", "2023"];

      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-6"
        >
          {annees.map((year) => (
            <motion.div
              key={year}
              whileHover={{ scale: 1.05 }}
              className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/90 hover:bg-white transition-all"
              onClick={() => navigate(`/matiere/${selectedMatiere.toLowerCase()}/${year}`)}
            >
              <img src={matiereImage} alt={`${selectedMatiere} ${year}`} className="w-48 h-48 object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-green-700/60 text-white text-center py-2 font-semibold">
                {selectedMatiere} — {year}
              </div>
            </motion.div>
          ))}
        </motion.div>
      );
    }

    return (
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gray-700 text-lg text-center mt-20"
      >
        👈 Sélectionnez une section à gauche pour commencer.
      </motion.p>
    );
  };

  // --- Structure générale
  return (
    <div
      className="h-screen w-screen flex text-white"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Sidebar */}
      <motion.div
        className="w-1/8 bg-blue-900/40 backdrop-blur-md p-4 flex flex-col gap-8 shadow-2xl"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        {/* QCE par concours */}
        <div>
          <h3 className="font-bold text-lg mb-3 text-yellow-200">🎯 QCE par Concours</h3>
          <button
            onClick={() => {
              setSection("concours");
              setSelectedMatiere(null);
            }}
            className="py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition w-full"
          >
            Concours
          </button>
        </div>

        {/* QCE par matière */}
        <div>
          <h3 className="font-bold text-lg mb-3 text-yellow-300">📚 QCE par Matière</h3>
          <div className="flex flex-col gap-2">
            {matieres.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setSection("matiere");
                  setSelectedMatiere(m);
                }}
                className="py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Contenu central */}
      <motion.div
        className="flex-1 bg-white/80 backdrop-blur-md rounded-l-3xl shadow-lg p-4 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {renderCenterContent()}
      </motion.div>
    </div>
  );
}
