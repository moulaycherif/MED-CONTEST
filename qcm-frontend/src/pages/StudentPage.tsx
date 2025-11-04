// ✅ src/pages/StudentPage.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

// 📘 Interface question
interface Question {
  _id: string;
  texte: string;
  options: string[];
  reponseCorrecte: string;
  subject: string;
  note: number;
}

// ✅ Composant principal
export default function StudentPage() {
  const [view, setView] = useState<
    "accueil" | "concoursList" | "matiereList" | "soutien" | "questions"
  >("accueil");
  const [exams, setExams] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const navigate = useNavigate();

  // 🔹 Chargement des examens depuis l’API
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/questions/exams`)
      .then((res) => setExams(res.data || []))
      .catch(console.error);
  }, []);

  // 🔹 Fonction pour charger les questions d’un concours ou matière
  const loadQuestions = (exam: string, subject?: string) => {
    const params: any = { exam };
    if (subject) params.subject = subject;
    axios
      .get(`${API_BASE_URL}/api/questions`, { params })
      .then((res) => {
        setQuestions(res.data || []);
        setView("questions");
      })
      .catch(console.error);
  };

  // 🔹 Charger automatiquement les images de matières depuis /src/assets
  const importAll = (r: any) => {
    let images: { [key: string]: string } = {};
    r.keys().forEach((item: string) => {
      const name = item.replace("./", "").replace(/\.(jpg|jpeg|png|jfif|svg)$/, "");
      images[name.toLowerCase()] = r(item);
    });
    return images;
  };

  const allImages = importAll(
    require.context("../assets", false, /\.(png|jpe?g|svg|jfif)$/)
  );

  const subjects = [
    "Maths",
    "Physique",
    "Chimie",
    "SVT",
  ];

  // ✅ Rendu principal
  return (
    <div
      className="flex min-h-screen text-white"
      style={{
        backgroundImage: `url("/src/assets/bg_med.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 🧭 COLONNE GAUCHE */}
      <motion.div
        className="w-64 bg-[rgba(15,23,42,0.85)] backdrop-blur-md p-5 flex flex-col gap-8 shadow-2xl fixed top-0 left-0 bottom-0"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        {/* Logo */}
        <h1 className="text-2xl font-extrabold text-yellow-400 text-center mb-6">
          🩺 MED-CONTEST
        </h1>

        {/* QCE par concours */}
        <div>
          <h2 className="text-yellow-400 font-semibold text-lg mb-3">🎯 QCE par Concours</h2>
          <button
            onClick={() => {
              setView("concoursList");
              setSelectedSubject(null);
            }}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            Concours
          </button>
        </div>

        {/* QCE par matière */}
        <div>
          <h2 className="text-yellow-400 font-semibold text-lg mb-3">📘 QCE par Matière</h2>
          <div className="flex flex-col gap-2">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setView("matiereList");
                  setSelectedSubject(s);
                }}
                className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Soutien */}
        <div>
          <h2 className="text-yellow-400 font-semibold text-lg mb-3">💡 Soutien</h2>
          <div className="flex flex-col gap-2">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setView("soutien");
                  setSelectedSubject(s);
                }}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 🧠 COLONNE CENTRALE */}
      <motion.div
        className="ml-64 flex-1 p-10 backdrop-blur-lg bg-white/10 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* ACCUEIL */}
        {view === "accueil" && (
          <p className="text-center text-[#f1f5f9] text-xl mt-40">
            👋 Choisissez une section à gauche pour commencer votre entraînement.
          </p>
        )}

        {/* LISTE DES CONCOURS */}
        {view === "concoursList" && (
          <div>
            <h2 className="text-3xl font-bold text-center mb-8 text-yellow-400">
              🏆 Choisissez un concours
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {exams.map((exam) => (
                <motion.div
                  key={exam}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/10 hover:bg-white/20 transition"
                  onClick={() => loadQuestions(exam)}
                >
                  <img
                    src={allImages["concours"] || "/src/assets/concours.jfif"}
                    alt={exam}
                    className="w-full h-40 object-cover"
                  />
                  <p className="text-center py-3 font-semibold">{exam}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* LISTE DES CONCOURS PAR MATIÈRE */}
        {view === "matiereList" && selectedSubject && (
          <div>
            <h2 className="text-3xl font-bold text-center mb-8 text-yellow-400">
              📘 {selectedSubject} — Choisissez un concours
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {exams.map((exam) => (
                <motion.div
                  key={exam}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/10 hover:bg-white/20 transition"
                  onClick={() => loadQuestions(exam, selectedSubject)}
                >
                  <img
                    src={
                      allImages[selectedSubject.toLowerCase()] ||
                      allImages["concours"] ||
                      "/src/assets/concours.jfif"
                    }
                    alt={selectedSubject}
                    className="w-full h-40 object-cover"
                  />
                  <p className="text-center py-3 font-semibold">{exam}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* SOUTIEN */}
        {view === "soutien" && selectedSubject && (
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">
              💡 Soutien : {selectedSubject}
            </h2>
            <p className="text-lg text-gray-100">
              Contenu de soutien et astuces pour {selectedSubject} — à venir.
            </p>
          </div>
        )}

        {/* QUESTIONS */}
        {view === "questions" && (
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">📚 Questions</h2>
            {questions.length > 0 ? (
              <p className="text-gray-100">Affichage des questions du QCM sélectionné.</p>
            ) : (
              <p className="text-gray-400">Aucune question trouvée.</p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
