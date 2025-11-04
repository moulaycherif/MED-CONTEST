import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// 📸 Charger automatiquement toutes les images du dossier assets
const images = import.meta.glob("../assets/*.{png,jpg,jpeg,jfif}", { eager: true });
const imageList = Object.values(images).map((mod: any) => mod.default);

export default function StudentPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState<"concours" | "matiere" | "soutien" | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<string | null>(null);

  const matieres = ["Mathématiques", "Physique", "Chimie", "SVT"];

  // --- Contenu central selon section ---
  const renderCenterContent = () => {
    if (section === "concours") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-6 justify-center"
        >
          {["2021", "2022", "2023"].map((year, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/90 hover:bg-white transition-all"
              onClick={() => navigate(`/exam/${year}`)}
            >
              <img
                src={imageList[i % imageList.length]}
                alt={`Concours ${year}`}
                className="w-48 h-48 object-cover"
              />
              <p className="text-center py-3 font-semibold text-blue-700">
                Concours {year}
              </p>
            </motion.div>
          ))}
        </motion.div>
      );
    }

    if (section === "matiere" && selectedMatiere) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-6 justify-center"
        >
          {imageList.map((img, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/90 hover:bg-white transition-all"
              onClick={() => navigate(`/matiere/${selectedMatiere.toLowerCase()}`)}
            >
              <img
                src={img}
                alt={`${selectedMatiere} ${i}`}
                className="w-48 h-48 object-cover"
              />
              <p className="text-center py-3 font-semibold text-green-700">
                {selectedMatiere}
              </p>
            </motion.div>
          ))}
        </motion.div>
      );
    }

    if (section === "soutien" && selectedMatiere) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-6 justify-center"
        >
          {imageList.map((img, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/90 hover:bg-white transition-all"
              onClick={() => navigate(`/soutien/${selectedMatiere.toLowerCase()}`)}
            >
              <img
                src={img}
                alt={`${selectedMatiere} soutien ${i}`}
                className="w-48 h-48 object-cover"
              />
              <p className="text-center py-3 font-semibold text-purple-700">
                {selectedMatiere}
              </p>
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

  return (
    <div
      className="min-h-screen flex text-white"
      style={{
        backgroundImage: `url("/src/assets/bg_med.jpg")`,
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
