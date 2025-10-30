import React, { useState } from "react";
import { motion } from "framer-motion";
import StudentDashboardFull from "./StudentDashboardFull";
import AdminDashboard from "./AdminDashboard";
import BackgroundWrapper from "../components/BackgroundWrapper";
import BackEn from "../components/BackEn";
import BackEt from "../components/BackEt";

export default function HomePage() {
  const [mode, setMode] = useState<"student" | "admin" | "">("");

  return (
    <BackgroundWrapper>
      <main className="flex flex-col min-h-screen p-8 text-center">
        {/* Titre en haut */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl font-bold text-black drop-shadow-lg mb-10"
        >
          🎓 QCM - Médecine
        </motion.h1>

        {/* Contenu principal centré */}
        {mode === "" && (
          <motion.div
            className="flex flex-col md:flex-row items-center justify-center flex-grow gap-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
{/* Bouton Étudiant */}
  <button
    onClick={() => setMode("student")}
    className="relative flex flex-col items-center justify-center hover:bg-stone-300 text-black font-semibold py-6 px-12 rounded-2xl shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl"
    style={{
      backgroundImage: `src/Image_Back.jfif`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    👨‍🎓 Étudiant
  </button>

            
            {/* Bouton Enseignant */}
  <button
    onClick={() => setMode("admin")}
    className="relative flex flex-col items-center justify-center hover:bg-stone-200 text-black font-semibold py-6 px-12 rounded-2xl shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl"
    style={{
      backgroundImage: `src/Image2.jfif`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    👩‍🏫 Enseignant
  </button>
          </motion.div>
        )}

        {/* Dashboards */}
        {mode === "student" && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full mt-6 bg-white/90 text-gray-900 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-700">
                🧩 Tableau de bord Étudiant
              </h2>
              <button
                onClick={() => setMode("")}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                🔙 Retour
              </button>
            </div>
            <StudentDashboardFull />
          </motion.div>
        )}

        {mode === "admin" && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full mt-6 bg-white/90 text-gray-900 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-green-700">
                🧠 Tableau de bord Enseignant
              </h2>
              <button
                onClick={() => setMode("")}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                🔙 Retour
              </button>
            </div>
            <AdminDashboard />
          </motion.div>
        )}
      </main>
    </BackgroundWrapper>
  );
}
