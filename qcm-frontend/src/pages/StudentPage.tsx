import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../config";

// ✅ Importation des images
import concoursImg from "../assets/CONCOURS.jfif";
import mathsImg from "../assets/MATHS.jfif";
import physiqueImg from "../assets/PHYSIQUE.jfif";
import chimieImg from "../assets/CHIMIE.jfif";
import svtImg from "../assets/SVT.jfif";
import bgImage from "/Image3.jfif";

import AnimatedQaViewer from "../components/AnimatedQaViewer";
import { fetchAstucesByChapitre, Astuce } from "../api/api";

import StudentSummaries from "./StudentSummaries";


interface Question {
  _id: string;
  texte: string;
  options: string[];
  reponseCorrecte: string;
  note: number;
}

export default function StudentPage() {
  const [section, setSection] = useState<"concours" | "matiere" | "soutien" | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<string | null>(null);
  const [currentExam, setCurrentExam] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Pour le soutien
  const [selectedChapitre, setSelectedChapitre] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const matieres = ["Mathématique", "Physique", "Chimie", "SVT"];

  const chapitresMaths = [
    "Chapitre I : Suites & Sommes",
    "Chapitre II : Limites, Continuité & Dérivabilité",
    "Chapitre III : Étude de fonctions",
    "Chapitre IV : Nombres complexes",
    "Chapitre V : Intégrales",
    "Chapitre VI : Géométrie dans l'espace",
    "Chapitre VII : Probabilité",
  ];

  // const [astuces, setAstuces] = useState<{ question: string; answer: string }[]>([]);
  const [astuces, setAstuces] = useState<Astuce[]>([]);



  // 🔹 Charger les questions quand currentExam change
  useEffect(() => {
    if (currentExam && selectedMatiere) {
      axios
        .get(
          `${API_BASE_URL}/api/questions?subject=${encodeURIComponent(
            selectedMatiere
          )}&exam=${encodeURIComponent(currentExam)}`
        )
        .then((res) => setQuestions(res.data))
        .catch(() => setQuestions([]));
    } else if (currentExam) {
      axios
        .get(`${API_BASE_URL}/api/questions?exam=${encodeURIComponent(currentExam)}`)
        .then((res) => setQuestions(res.data))
        .catch(() => setQuestions([]));
    }
  }, [currentExam, selectedMatiere]);

  // Charger les astuces quand on clique sur le bouton "Astuces"
useEffect(() => {
  if (selectedAction === "Astuces" && selectedChapitre) {
    axios
      .get(`${API_BASE_URL}/api/astuces/${encodeURIComponent(selectedChapitre)}`)
      .then((res) => setAstuces(res.data))
      .catch(() => setAstuces([]));
  }
}, [selectedAction, selectedChapitre]);

useEffect(() => {
  if (selectedAction === "Astuces" && selectedChapitre) {
    fetchAstucesByChapitre(selectedChapitre)
      .then((data) => setAstuces(data))
      .catch(() => setAstuces([]));
  }
}, [selectedAction, selectedChapitre]);



  // 🔹 Changement de réponse
  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  // 🔹 Correction locale
  const handleFinish = () => {
    let total = 0;
    questions.forEach((q) => {
      if (answers[q._id] === q.reponseCorrecte) total += q.note;
    });
    setScore(total);
    setSubmitted(true);
  };

  // --- Rendu principal ---
  const renderCenterContent = () => {
    // 🧩 Cas 1 : affichage des questions (QCE)
    if (currentExam) {
      if (questions.length === 0)
        return (
          <div className="text-center mt-10">
            <p className="text-gray-700 text-lg">Aucune question trouvée pour {currentExam}.</p>
          </div>
        );

      return (
        <div className="p-4">
          <h2 className="text-xl font-bold text-center mb-4 text-blue-800">
            📘 QCM — {currentExam}
          </h2>

          {questions.map((q, idx) => (
            <motion.div
              key={q._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 mb-4 bg-white rounded-xl shadow"
            >
              <h3 className="font-semibold mb-2">
                Q{idx + 1}) {q.texte}{" "}
                <span className="text-purple-600">({q.note} pt)</span>
              </h3>

              {q.options.map((opt, i) => (
                <label
                  key={i}
                  className={`block p-2 border rounded-lg cursor-pointer mb-2 ${
                    submitted
                      ? opt === q.reponseCorrecte
                        ? "bg-green-100 border-green-400"
                        : answers[q._id] === opt
                        ? "bg-red-100 border-red-400"
                        : ""
                      : "hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="radio"
                    name={q._id}
                    checked={answers[q._id] === opt}
                    onChange={() => handleAnswerChange(q._id, opt)}
                    disabled={submitted}
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))}
            </motion.div>
          ))}

          {!submitted ? (
            <button
              onClick={handleFinish}
              className="mt-4 px-6 py-2 bg-green-600 text-black rounded-lg"
            >
              ✅ Soumettre
            </button>
          ) : (
            <div className="mt-4 text-center text-lg font-semibold text-blue-700">
              ✅ Score final : {score} /{" "}
              {questions.reduce((sum, q) => sum + q.note, 0)}
            </div>
          )}
        </div>
      );
    }

    // 🧩 Cas 2 : QCE par concours
    if (section === "concours") {
      const annees = ["2025", "2024", "2023", "2022"];
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-6 justify-start items-start min-h-full"
        >
          {annees.map((year) => (
            <motion.div
              key={year}
              whileHover={{ scale: 1.05 }}
              className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/90 hover:bg-white transition-all"
              onClick={() => setCurrentExam(`MEDECINE ${year}`)}
            >
              <img src={concoursImg} alt={`Concours ${year}`} className="w-48 h-48 object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-white/60 text-black text-center py-2 font-semibold">
                MEDECINE {year}
              </div>
            </motion.div>
          ))}
        </motion.div>
      );
    }

    // 🧩 Cas 3 : QCE par matière
    if (section === "matiere" && selectedMatiere) {
      const matiereImages: Record<string, string> = {
        Mathématique: mathsImg,
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
          className="flex flex-wrap gap-6 justify-start items-start min-h-full"
        >
          {annees.map((year) => (
            <motion.div
              key={year}
              whileHover={{ scale: 1.05 }}
              className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/90 hover:bg-white transition-all"
              onClick={() => setCurrentExam(`MEDECINE ${year}`)}
            >
              <img src={matiereImage} alt={`${selectedMatiere} — MEDECINE ${year}`} className="w-48 h-48 object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-green-700/60 text-black text-center py-2 font-semibold">
                {selectedMatiere} — MEDECINE {year}
              </div>
            </motion.div>
          ))}
        </motion.div>
      );
    }

    // 🧩 Cas 4 : Soutien (Mathématiques)
    if (section === "soutien" && selectedMatiere === "Mathématique") {
      // ✅ PDF ou Quiz
      if (selectedChapitre && selectedAction) {

// 📌 ASTUCES — QUESTIONS/RÉPONSES ANIMÉES
if (selectedAction === "Astuces") {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center mb-6">
        💡 {selectedChapitre} — Astuces
      </h2>

      {astuces.length === 0 ? (
        <p className="text-center text-gray-500">Aucune astuce trouvée…</p>
      ) : (
        <AnimatedQaViewer qas={astuces} />
      )}
    </div>
  );
}

        if (selectedAction === "Résumé") {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center mb-6">
        📘 {selectedChapitre} — Résumés disponibles
      </h2>

      <StudentSummaries selectedSubject={selectedMatiere} selectedChapitre={selectedChapitre} />
    </div>
  );
}


        // ✅ Mini Quiz
        const quiz = [
          {
            question: "Quelle est la définition d'une suite arithmétique ?",
            options: [
              "Chaque terme est le carré du précédent",
              "Chaque terme est la somme du précédent et d’une constante",
              "Chaque terme est le produit du précédent par une constante",
              "Chaque terme est aléatoire",
            ],
            correct: "Chaque terme est la somme du précédent et d’une constante",
          },
        ];

        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-center mb-6">
              {selectedChapitre} — {selectedAction}
            </h2>
            {quiz.map((q, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 mb-4 bg-white rounded-xl shadow"
              >
                <h3 className="font-semibold mb-2">{q.question}</h3>
                {q.options.map((opt, i) => (
                  <label key={i} className="block p-2 border rounded-lg cursor-pointer mb-2 hover:bg-gray-100">
                    <input type="radio" name={`q-${idx}`} className="mr-2" />
                    {opt}
                  </label>
                ))}
              </motion.div>
            ))}
          </div>
        );
      }

      // ✅ Chapitre sélectionné → 3 boutons
      if (selectedChapitre) {
        const actions = [
          { label: "💡 Astuces", color: "bg-yellow-400" },
          { label: "📘 Résumé", color: "bg-blue-400" },
          { label: "🧩 Exercices", color: "bg-green-400" },
        ];
        return (
          <div className="flex flex-col items-center justify-center gap-8 mt-20">
            <h2 className="text-2xl font-bold text-gray-800">{selectedChapitre}</h2>
            <div className="flex gap-8">
              {actions.map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedAction(action.label.replace(/[💡📘🧩]/g, "").trim())}
                  className={`${action.color} text-black font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-2xl transition`}
                >
                  {action.label}
                </motion.button>
              ))}
            </div>
          </div>
        );
      }

      // ✅ Liste des chapitres
      return (
        <div className="flex flex-wrap gap-6 justify-start items-start min-h-full">
          {chapitresMaths.map((chapitre, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/90 hover:bg-white transition-all"
              onClick={() => setSelectedChapitre(chapitre)}
            >
              <img src={mathsImg} alt={chapitre} className="w-48 h-48 object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-yellow-300/80 text-black text-center py-2 font-semibold">
                {chapitre}
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    // 🧩 Par défaut
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

  // --- Structure principale ---
  return (
    <div
      className="h-screen w-screen flex text-black"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ✅ Colonne gauche */}
      <motion.div
        className="w-1/8 bg-blue-900/40 backdrop-blur-md p-4 flex flex-col gap-8 shadow-2xl"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        {/* 🎯 QCE par concours */}
        <div>
          <h3 className="font-bold text-lg mb-3 text-yellow-200">🎯 QCE par Concours</h3>
          <button
            onClick={() => {
              setSection("concours");
              setSelectedMatiere(null);
              setCurrentExam(null);
            }}
            className="py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition w-full"
          >
            Concours
          </button>
        </div>

        {/* 📚 QCE par matière */}
        <div>
          <h3 className="font-bold text-lg mb-3 text-yellow-300">📚 QCE par Matière</h3>
          <div className="flex flex-col gap-2">
            {matieres.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setSection("matiere");
                  setSelectedMatiere(m);
                  setCurrentExam(null);
                }}
                className="py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* 💡 Soutien */}
        <div>
          <h3 className="font-bold text-lg mb-3 text-yellow-300">💡 Soutien</h3>
          <div className="flex flex-col gap-2">
            {matieres.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setSection("soutien");
                  setSelectedMatiere(m);
                  setSelectedChapitre(null);
                  setSelectedAction(null);
                }}
                className="py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ✅ Colonne centrale */}
      <motion.div
        className="flex-1 bg-white/80 backdrop-blur-md rounded-l-3xl shadow-lg p-4 overflow-y-auto relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* 🔙 Bouton Retour en haut à droite */}
        {(section || currentExam || selectedChapitre || selectedAction) && (
          <button
            onClick={() => {
              if (selectedAction) setSelectedAction(null);
              else if (selectedChapitre) setSelectedChapitre(null);
              else if (currentExam) setCurrentExam(null);
              else if (selectedMatiere) setSelectedMatiere(null);
              else setSection(null);
            }}
            className="absolute top-4 right-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
          >
            🔙 Retour
          </button>
        )}

        {renderCenterContent()}
      </motion.div>
    </div>
  );
}
