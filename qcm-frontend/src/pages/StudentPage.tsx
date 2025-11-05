import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function StudentPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState<"concours" | "matiere" | "soutien" | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<string | null>(null);

  const matieres = ["Mathématiques", "Physique", "Chimie", "SVT"];

  // --- Contenu central selon section ---
  const renderCenterContent = () => {
    // 🏆 SECTION CONCOURS
    if (section === "concours") {
      const concoursImage = "../assets/CONCOURS.jfif";
      const annees = ["2025", "2024", "2023", "2022"];

      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-6 justify-center"
        >
          {annees.map((year) => (
            <motion.div
              key={year}
              whileHover={{ scale: 1.05 }}
              className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/90 hover:bg-white transition-all"
              onClick={() => navigate(`/exam/${year}`)}
            >
              <img
                src={concoursImage}
                alt={`Concours ${year}`}
                className="w-48 h-48 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center py-2 font-semibold">
                Concours {year}
              </div>
            </motion.div>
          ))}
        </motion.div>
      );
    }

    // 📚 SECTION QCE PAR MATIÈRE
    if (section === "matiere" && selectedMatiere) {
      const matiereImages: Record<string, string> = {
        Mathématiques: "/src/assets/MATHS.JFIF",
        Physique: "/src/assets/PHYSIQUE.JFIF",
        Chimie: "/src/assets/CHIMIE.JFIF",
        SVT: "/src/assets/SVT.JFIF",
      };

      const matiereImage = matiereImages[selectedMatiere] || "/src/assets/default.jpg";
      const annees = ["2025", "2024", "2023"];

      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-6 justify-center"
        >
          {annees.map((year) => (
            <motion.div
              key={year}
              whileHover={{ scale: 1.05 }}
              className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/90 hover:bg-white transition-all"
              onClick={() => navigate(`/matiere/${selectedMatiere.toLowerCase()}`)}
            >
              <img
                src={matiereImage}
                alt={`${selectedMatiere} ${year}`}
                className="w-48 h-48 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-green-700/60 text-white text-center py-2 font-semibold">
                {selectedMatiere} — Concours {year}
              </div>
            </motion.div>
          ))}
        </motion.div>
      );
    }

    // 💡 SECTION SOUTIEN
    if (section === "soutien" && selectedMatiere) {
      const matiereImages: Record<string, string> = {
        Mathématiques: "/src/assets/MATHS.JFIF",
        Physique: "/src/assets/PHYSIQUE.JFIF",
        Chimie: "/src/assets/CHIMIE.JFIF",
        SVT: "/src/assets/SVT.JFIF",
      };

      const matiereImage = matiereImages[selectedMatiere] || "/src/assets/default.jpg";

      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-6 justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/90 hover:bg-white transition-all"
            onClick={() => navigate(`/soutien/${selectedMatiere.toLowerCase()}`)}
          >
            <img
              src={matiereImage}
              alt={`${selectedMatiere} soutien`}
              className="w-48 h-48 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-purple-700/60 text-white text-center py-2 font-semibold">
              Soutien — {selectedMatiere}
            </div>
          </motion.div>
        </motion.div>
      );
    }

    // 🕹️ PAR DÉFAUT
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

  // --- Structure globale de la page ---
  return (
    <div
      className="h-screen w-screen flex text-white"
      style={{
        backgroundImage: `url("/Image3.jfif")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ✅ COLONNE GAUCHE */}
      <motion.div
        className="w-1/5 bg-blue-900/60 backdrop-blur-md p-4 flex flex-col gap-8 shadow-2xl"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        {/* Logo */}
        <div className="text-center mb-4 font-extrabold text-yellow-400 text-xl">
          MED-CONTEST
        </div>

        {/* 🎯 QCE PAR CONCOURS */}
        <div>
          <h3 className="font-bold text-lg mb-3 text-yellow-300">🎯 QCE par Concours</h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setSection("concours");
                setSelectedMatiere(null);
              }}
              className="py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              Concours
            </button>
          </div>
        </div>

        {/* 📚 QCE PAR MATIÈRE */}
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

        {/* 💡 SOUTIEN */}
        <div>
          <h3 className="font-bold text-lg mb-3 text-yellow-300">💡 Soutien</h3>
          <div className="flex flex-col gap-2">
            {matieres.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setSection("soutien");
                  setSelectedMatiere(m);
                }}
                className="py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ✅ COLONNE CENTRALE */}
      <motion.div
        className="flex-1 bg-white/80 backdrop-blur-md rounded-l-3xl shadow-lg p-8 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {renderCenterContent()}
      </motion.div>
    </div>
  );
}
