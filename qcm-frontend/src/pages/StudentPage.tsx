import React, { useState } from "react";
import { motion } from "framer-motion";

export default function StudentPage() {
  const [section, setSection] = useState<"concours" | "matiere" | "soutien" | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<string | null>(null);

  const matieres = [
    { id: "bio", name: "Biologie" },
    { id: "chimie", name: "Chimie" },
    { id: "physique", name: "Physique" },
    { id: "maths", name: "Mathématiques" },
  ];

  // --- CONTENU CENTRAL ---
  const renderCenterContent = () => {
    if (section === "concours") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-6 justify-center"
        >
          {/* Exemple d'affichage dynamique */}
          {["Concours 2021", "Concours 2022", "Concours 2023"].map((c, i) => (
            <motion.div
              key={i}
              className="w-48 h-48 bg-white shadow-md rounded-2xl flex items-center justify-center text-blue-700 font-bold hover:scale-105 hover:shadow-xl transition-all cursor-pointer"
            >
              {c}
            </motion.div>
          ))}
        </motion.div>
      );
    }

    if (section === "matiere" && selectedMatiere) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-blue-800 mb-6">
            QCM de {selectedMatiere}
          </h2>
          <p className="text-gray-700">
            Liste des QCMs de {selectedMatiere} (affichée ici après intégration API).
          </p>
        </motion.div>
      );
    }

    if (section === "soutien" && selectedMatiere) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-purple-800 mb-6">
            Soutien : {selectedMatiere}
          </h2>
          <p className="text-gray-700">
            Contenu des astuces ou soutien pour {selectedMatiere}.
          </p>
        </motion.div>
      );
    }

    return (
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gray-700 text-lg text-center mt-20"
      >
        Sélectionnez une section à gauche pour commencer.
      </motion.p>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-4 w-full pt-20 px-4">

      {/* 📘 COLONNE GAUCHE */}
      <motion.div
        className="col-span-3 bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white space-y-6"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {/* QCE PAR CONCOURS */}
        <div>
          <h3 className="font-bold text-lg mb-3">🎯 QCE par Concours</h3>
          <button
            onClick={() => {
              setSection("concours");
              setSelectedMatiere(null);
            }}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow text-white"
          >
            Concours
          </button>
        </div>

        {/* QCE PAR MATIÈRE */}
        <div>
          <h3 className="font-bold text-lg mb-3">📚 QCE par Matière</h3>
          <div className="flex flex-col gap-2">
            {matieres.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSection("matiere");
                  setSelectedMatiere(m.name);
                }}
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg shadow"
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* SOUTIEN */}
        <div>
          <h3 className="font-bold text-lg mb-3">🧠 Soutien</h3>
          <div className="flex flex-col gap-2">
            {matieres.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSection("soutien");
                  setSelectedMatiere(m.name);
                }}
                className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg shadow"
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 🎯 COLONNE CENTRALE (reste de la page) */}
      <motion.div
        className="col-span-9 bg-white/80 rounded-2xl shadow-lg p-6 min-h-[70vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {renderCenterContent()}
      </motion.div>
    </div>
  );
}
