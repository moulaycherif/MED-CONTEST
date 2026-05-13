import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import parse from "html-react-parser";

// ✅ Importation pour le rendu LaTeX et Rich Text
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import katex from "katex";
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";

import { API_BASE_URL } from "../config";
import { fetchAstucesByChapter } from "../api/astuces.api";

// ✅ Importation des images
import concoursImg from "../assets/CONCOURS.jfif";
import mathsImg from "../assets/MATHS.jfif";
import physiqueImg from "../assets/PHYSIQUE.jfif";
import chimieImg from "../assets/CHIMIE.jfif";
import svtImg from "../assets/SVT.jfif";
import bgImage from "/Image3.jfif";

// ✅ Importation des composants
import StudentDashboardStats from "../components/stats/StudentDashboardStats";
import StudentAstuceDetail from "./StudentAstuceDetail";
import PdfViewer from "../components/PdfViewer";

// Indispensable pour que React-Quill puisse interpréter les formules
(window as any).katex = katex;

// --- Interfaces ---
interface Astuce {
  _id: string;
  title?: string;
  chapter?: string;
  subject?: string;
  description?: string;
  cases?: TipCase[];
  pdfUrl?: string;
}

interface TipCase {
  title?: string;
  content?: string;
  image?: string;
}

interface Question {
  _id: string;
  texte?: string;
  image?: string | null;
  groupId?: {
    _id: string;
    image?: string | null;
    order?: number;
  } | null;
  options: string[];
  reponseCorrecte: string;
  note: number;
}

export default function StudentPage() {
  const navigate = useNavigate();

  // --- États de Navigation & Sélections ---
  const [section, setSection] = useState<"home" | "concours" | "matiere" | "soutien" | "qcm">("home");
  const [selectedMatiere, setSelectedMatiere] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [currentExam, setCurrentExam] = useState<string | null>(null);
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);

  // --- États QCM ---
  const [exams, setExams] = useState<{ _id: string; title: string }[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // --- États Exercices (Soutien) ---
  const [exercises, setExercises] = useState<any[]>([]);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState<{ [id: string]: string }>({});
  const [exerciseSubmitted, setExerciseSubmitted] = useState(false);
  const [exerciseScore, setExerciseScore] = useState<number | null>(null);
  const [wrongExercises, setWrongExercises] = useState<any[]>([]);
  const [exerciseAttempt, setExerciseAttempt] = useState(1);

  // --- États Astuces & Résumés ---
  const [astuces, setAstuces] = useState<Astuce[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedresume, setSelectedresume] = useState<any | null>(null);
  const [selectedTipId, setSelectedTipId] = useState<string | null>(null);
  const [selectedTip, setSelectedTip] = useState<Astuce | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  const matieres = ["Mathématique", "Physique", "Chimie", "SVT"];
  const isShortResume = (selectedresume?.chapter?.length ?? 0) < 30;

  // ✅ Touche ESC pour fermer le modal des astuces
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedTip(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // ✅ Charger la liste des examens
  useEffect(() => {
    const token = localStorage.getItem("token"); // <-- 1. Récupérer le token
    axios
      .get(`${API_BASE_URL}/api/questions/exams`, {
        headers: { Authorization: `Bearer ${token}` } // <-- 2. L'ajouter ici
      })
      .then((res) => setExams(res.data))
      .catch((err) => console.error("❌ Exams load error", err));
  }, []);

  // ✅ Charger les résumés
  useEffect(() => {
    if (selectedAction !== "Résumé" || !selectedChapter) return;
    const token = localStorage.getItem("token"); 
    
    axios
      .get(`${API_BASE_URL}/api/resume/by-chapter/${encodeURIComponent(selectedChapter)}`, {
        headers: { Authorization: `Bearer ${token}` } // <-- Ajout ici
      })
      .then((res) => setResumes(res.data))
      .catch((err) => {
        console.error("❌ SUMMARY ERROR =", err);
        setResumes([]);
      });
  }, [selectedAction, selectedChapter]);

  // ✅ Charger les questions d'un examen
  useEffect(() => {
    if (currentExam) {
      let url = `${API_BASE_URL}/api/questions?exam=${encodeURIComponent(currentExam)}`;
      if (selectedMatiere) {
        url += `&subject=${encodeURIComponent(selectedMatiere)}`;
      }
      
      const token = localStorage.getItem("token");
      
      axios
        .get(url, {
          headers: { Authorization: `Bearer ${token}` } // <-- Ajout ici
        })
        .then((res) => setQuestions(res.data))
        .catch((err) => {
          console.error("❌ Erreur fetch questions:", err);
          setQuestions([]);
        });
    }
  }, [currentExam, selectedMatiere]);

  // ✅ Charger les astuces
  useEffect(() => {
    if (!selectedChapter) return;
    if (selectedAction === "Astuces") {
      fetchAstucesByChapter(selectedChapter)
        .then((data) => setAstuces(data as Astuce[]))
        .catch(() => setAstuces([]));
    }
  }, [selectedAction, selectedChapter]);

  // ✅ Charger les exercices
  useEffect(() => {
    if (selectedAction === "Exercises" && selectedChapter && selectedMatiere) {
      const token = localStorage.getItem("token");
      
      axios
        .get(`${API_BASE_URL}/api/exercises/${encodeURIComponent(selectedMatiere)}/${encodeURIComponent(selectedChapter)}`, {
          headers: { Authorization: `Bearer ${token}` } // <-- Ajout ici
        })
        .then((res) => {
          setExercises(res.data || []);
          setExerciseIndex(0);
          setExerciseAnswers({});
          setExerciseSubmitted(false);
          setExerciseScore(null);
        })
        .catch(() => setExercises([]));
    }
  }, [selectedAction, selectedChapter, selectedMatiere]);

  // --- Utilitaires ---
  const resetQcm = () => {
    setCurrentExam(null);
    setCurrentExamId(null);
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  function cleanLatex(content?: string) {
    if (!content) return "";
    return content
      .replace(/<\/?p>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/\\\(/g, "$")
      .replace(/\\\)/g, "$")
      // 🚨 NOUVEAU : Nettoyage agressif de "below"
      .replace(/\\?below\s*\{([^}]*)\}/g, "_{$1}")
      .replace(/\\?below/g, "_")
      // (Le reste ne change pas)
      .replace(/\\aleph/g, "\\mathbb{N}")
      .replace(/\\rightarrow/g, "\\to")
      .replace(/lim\s*n\s*(?:-->|→)\s*(?:infini|∞)/gi, "$\\displaystyle \\lim_{n\\to\\infty}$")
      .replace(/\\lim_\{/g, "\\displaystyle \\lim_{") 
      .replace(/\\ /g, " ")
      .replace(/\s+/g, " ");
  }

  function renderContent(content?: string) {
    if (!content) return null;
    return (
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{
          __html: cleanLatex(content), // ✅ Nettoyage appliqué ici
        }}
      />
    );
  }

  // --- Gestion du QCM ---
  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

 const handleFinish = async () => {
  if (!currentExamId) {
    console.error("❌ ExamId manquant");
    return;
  }

  let total = 0;

  questions.forEach((q) => {
    if (answers[q._id] === q.reponseCorrecte) {
      total += q.note;
    }
  });

  const totalQuestions = questions.length;

  const totalPossiblePoints = questions.reduce(
    (sum, q) => sum + q.note,
    0
  );

  const successRate =
    totalPossiblePoints > 0
      ? Math.round((total / totalPossiblePoints) * 100)
      : 0;

  setScore(total);
  setSubmitted(true);

  try {
    
    // ✅ Enregistrement soumission QCM
    const token = localStorage.getItem("token");
    await axios.post(
      `${API_BASE_URL}/api/student/exams/${currentExamId}/submit`,
      {
        answers,
        subject: selectedMatiere || "CONCOURS",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // ✅ Enregistrement activité statistiques
    
    await axios.post(
      `${API_BASE_URL}/api/student-activity`,
      {
        type: "QCM",
        subject: selectedMatiere || "CONCOURS",
        chapter: currentExam,
        referenceId: currentExamId,

        // 📊 statistiques
        score: total,
        totalQuestions,
        successRate,

        // infos supplémentaires
        examId: currentExamId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

  } catch (err) {
    console.error("❌ Erreur enregistrement QCM", err);
  }
};

  // --- Rendu Central ---
  const renderCenterContent = () => {
    if (selectedTipId) {
      return (
        <StudentAstuceDetail
          id={selectedTipId}
          onBack={() => setSelectedTipId(null)}
        />
      );
    }

    // 🏠 PAGE D’ACCUEIL → STATISTIQUES UNIQUEMENT
    if (section === "home") {
      return <StudentDashboardStats />;
    }

    // 🧩 Cas 1 : affichage des questions (QCE)
    if (section === "qcm" && currentExam) {
      let lastGroupId: string | null = null;

      if (questions.length === 0)
        return (
          <div className="text-center mt-10">
            <p className="text-gray-700 text-lg">
              Aucune question trouvée pour {currentExam}.
            </p>
          </div>
        );

      return (
        <div className="p-4">
          <h2 className="text-xl font-bold text-center mb-4 text-blue-800">
            📘 QCE — {currentExam}
          </h2>

          {questions.map((q, idx) => {
            const showGroupImage = q.groupId?.image && q.groupId._id !== lastGroupId;
            if (q.groupId?._id) {
              lastGroupId = q.groupId._id;
            }

            return (
              <motion.div
                key={q._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 mb-4 bg-white rounded-xl shadow"
              >
                {/* 🖼 IMAGE DE GROUPE */}
                {showGroupImage && (
                  <img
                    src={`${API_BASE_URL}${q.groupId!.image}`}
                    className="max-w-lg mx-auto my-4 rounded shadow"
                    alt="Image du groupe"
                  />
                )}

                {/* 🧠 QUESTION */}
                <h3 className="font-semibold mb-2">
                  Q{idx + 1}) {q.texte}
                  <span className="text-purple-600"> ({q.note} pt)</span>
                </h3>

                {/* 🖼 IMAGE SIMPLE */}
                {!q.groupId && q.image && (
                  <img
                    src={`${API_BASE_URL}${q.image}`}
                    className="max-w-lg my-3 rounded shadow"
                    alt="Illustration"
                  />
                )}

                {/* OPTIONS */}
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
            );
          })}

          {!submitted ? (
            <button
              onClick={handleFinish}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              ✅ Soumettre
            </button>
          ) : (
            <div className="mt-4 text-center text-lg font-semibold text-blue-700">
              ✅ Score final : {score} / {questions.reduce((sum, q) => sum + q.note, 0)}
            </div>
          )}
        </div>
      );
    }

    // 🧩 Cas 2 : QCE par concours
    if (section === "concours") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-6 justify-start items-start min-h-full"
        >
          {exams.map((exam) => (
            <motion.div
              key={exam._id}
              whileHover={{ scale: 1.05 }}
              className="relative cursor-pointer rounded-2xl overflow-y-auto shadow-lg bg-white/90 hover:bg-white transition-all"
              onClick={() => {
                resetQcm();
                setSection("qcm");
                setCurrentExam(exam.title);
                setCurrentExamId(exam._id);
              }}
            >
              <img src={concoursImg} className="w-48 h-48 object-cover" alt={exam.title} />
              <div className="absolute bottom-0 left-0 right-0 bg-white/60 text-black text-center py-2 font-semibold">
                {exam.title}
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
      const filteredExams = exams.filter((e) => e.title.startsWith("MEDECINE"));

      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-6 justify-start items-start min-h-full"
        >
          {filteredExams.map((exam) => (
            <motion.div
              key={exam._id}
              whileHover={{ scale: 1.05 }}
              className="relative cursor-pointer rounded-2xl overflow-y-auto shadow-lg bg-white/90 hover:bg-white transition-all"
              onClick={() => {
                resetQcm();
                setSection("qcm");
                setCurrentExam(exam.title);
                setCurrentExamId(exam._id);
              }}
            >
              <img
                src={matiereImage}
                alt={`${selectedMatiere} — ${exam.title}`}
                className="w-48 h-48 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-green-700/60 text-white text-center py-2 font-semibold">
                {selectedMatiere} — {exam.title}
              </div>
            </motion.div>
          ))}
        </motion.div>
      );
    }

    // 🧩 Cas 4 : Soutien — TOUTES LES MATIÈRES
    if (section === "soutien" && selectedMatiere) {
      const subjectImages: Record<string, string> = {
        Mathématique: mathsImg,
        Physique: physiqueImg,
        Chimie: chimieImg,
        SVT: svtImg,
      };

      const chaptersBySubject: Record<string, string[]> = {
        Mathématique: [
          "Chapitre I : Suites & Sommes",
          "Chapitre II : Limites, Continuité & Dérivabilité",
          "Chapitre III : Étude de fonctions",
          "Chapitre IV : Nombres complexes",
          "Chapitre V : Intégrales",
          "Chapitre VI : Géométrie dans l'espace",
          "Chapitre VII : Probabilité",
        ],
        Physique: [
          "Chapitre I : Cinématique",
          "Chapitre II : Dynamique",
          "Chapitre III : Travail & Énergie",
          "Chapitre IV : Électricité",
          "Chapitre V : Optique",
        ],
        Chimie: [
          "Chapitre I : Combustion",
          "Chapitre II : Oxydoréduction",
          "Chapitre III : Acides & Bases",
          "Chapitre IV : Solutions",
        ],
        SVT: ["Chapitre I : Génétique", "Chapitre II : Immunologie", "Chapitre III : Métabolisme"],
      };

      const chapters = chaptersBySubject[selectedMatiere] || [];

      // 👉 1) ASTUCES
      if (selectedChapter && selectedAction === "Astuces") {
        return (
          <div className="p-6 relative">
            <h2 className="text-3xl font-bold text-center mb-8">💡 {selectedChapter} — Astuces</h2>

            {astuces.length === 0 ? (
              <p className="text-center text-gray-500">Aucune astuce trouvée…</p>
            ) : (
              <div className="flex flex-wrap gap-3 justify-center">
                {astuces.map((tip) => (
                  <motion.button
                    key={tip._id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                   onClick={async () => {
  setSelectedTip(tip);
  setFocusMode(true);

  try {
    const token = localStorage.getItem("token");
    await axios.post(`${API_BASE_URL}/api/student-activity`, {
      type: "ASTUCE",
      subject: selectedMatiere,
      chapter: selectedChapter,
      referenceId: tip._id,
    },
        { headers: { Authorization: `Bearer ${token}` } } // ✅ Corrigé : passé dans la configuration d'Axios
      );
    } catch (err) {
      console.error(err);
    }
  }}
                    className="px-5 py-2 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 shadow transition"
                  >
                    {tip.title}
                  </motion.button>
                ))}
              </div>
            )}

            {/* 🔥 MODAL ASTUCES */}
            {selectedTip && (
              <motion.div
                className={`fixed inset-0 flex items-center justify-center z-50 transition ${
                  focusMode ? "bg-violet-900/80 backdrop-blur-md" : "bg-white/50 backdrop-blur-sm"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedTip(null)}
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden p-6 relative"
                  initial={{ scale: 0.8, y: 50, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 120 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setSelectedTip(null);
                      setFocusMode(false);
                    }}
                    className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
                  >
                    ✖
                  </button>

                  <h2 className="text-2xl font-bold mb-4 text-center">{selectedTip.title}</h2>

                  {/* PDF Viewer */}
                  {selectedTip?.pdfUrl && <PdfViewer key={selectedTip._id} url={selectedTip?.pdfUrl} />}

                  {/* Contenu textuel */}
                  {!selectedTip.pdfUrl &&
                    selectedTip.cases?.map((c, i) => (
                      <div key={i} className="mb-8 overflow-y-auto max-h-[60vh]">
                        {c.title && <h3 className="font-semibold text-lg mb-2 text-indigo-700">{c.title}</h3>}
                        {c.image && (
                          <div className="flex justify-center mb-4">
                            <img src={c.image} className="max-h-72 object-contain rounded-xl shadow" alt={c.title} />
                          </div>
                        )}
                        {c.content && (
                          <div className="prose prose-lg max-w-none bg-white p-6 rounded-xl shadow">
                            {renderContent(c.content || "")}
                          </div>
                        )}
                      </div>
                    ))}
                </motion.div>
              </motion.div>
            )}
          </div>
        );
      }

      // 👉 2) RÉSUMÉS
      if (selectedChapter && selectedAction === "Résumé") {
        return (
          <div className="p-6 relative">
            <h2 className="text-3xl font-bold text-center mb-8">📘 {selectedChapter} — Résumés</h2>

            {resumes.length === 0 ? (
              <p className="text-center text-gray-500">Aucun résumé trouvé…</p>
            ) : (
              <div className="flex flex-wrap gap-3 justify-center">
                {resumes.map((sum) => (
                  <button
                    key={sum._id}
                    onClick={async () => {
  setSelectedresume(sum);

  try {
    const token = localStorage.getItem("token");
    await axios.post(`${API_BASE_URL}/api/student-activity`, {
      type: "RESUME",
      subject: selectedMatiere,
      chapter: selectedChapter,
      referenceId: sum._id,
    },
        { headers: { Authorization: `Bearer ${token}` } } // ✅ Corrigé
      );
    } catch (err) {
      console.error(err);
    }
  }}
                    className="px-5 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 shadow"
                  >
                    {sum.chapter}
                  </button>
                ))}
              </div>
            )}

            {/* 🔥 MODAL RÉSUMÉS */}
            {selectedresume && (
              <div
                className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                onClick={() => setSelectedresume(null)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl ${
                    isShortResume ? "max-h-[55vh]" : "max-h-[75vh]"
                  } flex flex-col`}
                >
                  <h2 className="text-lg font-bold p-3 text-center border-b">{selectedresume.chapter}</h2>
                  <div className="flex-1 overflow-y-auto p-2">
                    <iframe
                      src={selectedresume.pdfUrl + "#toolbar=0"}
                      className="w-full h-full min-h-[300px] rounded-b-2xl"
                      title="Résumé PDF"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

     // 👉 3) EXERCICES (Mis à jour avec KaTeX/Latex)
      if (selectedChapter && selectedAction === "Exercises") {
        const currentEx = exercises[exerciseIndex];

        if (exercises.length === 0) {
          return <p className="text-center mt-10">Aucun exercice trouvé</p>;
        }

        // ✅ Fonction pour forcer le LaTeX dans Quill (Questions & Explications)
        const processQuillText = (text?: string) => {
          if (!text) return "";
          return text
          // 🚨 NOUVEAU : On intercepte et on détruit "\below" ou "below" pour le remplacer par "_"
            .replace(/\\?below\s*\{/g, "_{")
            .replace(/\\?below/g, "_")
            // Gère le texte tapé à la main (Quill convertit "->" en "--&gt;")
            .replace(/lim\s*n\s*(?:--&gt;|-->|→)\s*(?:infini|∞)/gi, '<span class="ql-formula" data-value="\\displaystyle \\lim_{n \\to \\infty}"></span>')
            // Gère les formules insérées via l'outil mathématique de Quill
            .replace(/data-value="\\lim_/g, 'data-value="\\displaystyle \\lim_');
        };

        return (
          <div className="p-6 exercice-view-container">
            {/* ✅ SOLUTION IMAGES : Forcer la réduction des images de Quill avec !important */}
            <style>{`
              .exercice-view-container img, .ql-editor img {
                max-height: 150px !important;
                width: auto !important;
                max-width: 100% !important;
                margin: 0 auto;
                display: block;
                object-fit: contain;
                border-radius: 8px;
              }
            `}</style>

            {/* 🟦 PROGRESSION */}
            <div className="mb-4 text-center">
              <p className="font-semibold">
                Question {exerciseIndex + 1} / {exercises.length}
              </p>
              <div className="w-full bg-gray-200 h-2 rounded mt-2">
                <div
                  className="bg-blue-600 h-2 rounded"
                  style={{ width: `${((exerciseIndex + 1) / exercises.length) * 100}%` }}
                />
              </div>
            </div>

            {/* 🧠 QUESTION */}
            <div className="bg-white p-4 rounded-xl shadow">
              <h3 className="font-semibold mb-3">
                <ReactQuill 
                  value={processQuillText(currentEx.question)} 
                  readOnly={true} 
                  theme="bubble" 
                />
              </h3>

              {currentEx.questionImage && (
                <img
                  src={`${API_BASE_URL}${currentEx.questionImage}`}
                  alt="Question"
                  className="h-24 md:h-32 w-auto object-contain mx-auto rounded shadow mb-4"
                />
              )}

              {/* 🎯 OPTIONS */}
              {currentEx.options.map((opt: string, i: number) => {
                const isSelected = exerciseAnswers[currentEx._id] === opt;
                const isCorrect = opt === currentEx.correctAnswer;

                return (
                  <label
                    key={i}
                    className={`block p-2 border rounded-lg mb-2 cursor-pointer ${
                      exerciseSubmitted
                        ? isSelected && isCorrect
                          ? "bg-green-100 border-green-400"
                          : isSelected && !isCorrect
                          ? "bg-red-100 border-red-400"
                          : ""
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={isSelected}
                      disabled={exerciseSubmitted}
                      onChange={() =>
                        setExerciseAnswers((prev) => ({
                          ...prev,
                          [currentEx._id]: opt,
                        }))
                      }
                      className="mr-2"
                    />
                    {/* Les options passent par le cleanLatex classique */}
                    <Latex>{cleanLatex(opt)}</Latex>
                  </label>
                );
              })}

              {/* 💡 EXPLICATION */}
              {exerciseSubmitted && exerciseAnswers[currentEx._id] !== currentEx.correctAnswer && (
                <div className="text-blue-600 mt-3 border-t pt-3">
                  <span className="font-bold">Explication :</span>
                  <ReactQuill 
                    value={processQuillText(currentEx.explanation)} 
                    readOnly={true} 
                    theme="bubble" 
                  />
                </div>
              )}
            </div>

            {/* 🔁 NAVIGATION */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setExerciseIndex((i) => i - 1)}
                disabled={exerciseIndex === 0}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                ⬅️ Précédent
              </button>

              <button
                onClick={() => setExerciseIndex((i) => i + 1)}
                disabled={exerciseIndex === exercises.length - 1}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                ➡️ Suivant
              </button>
            </div>

            {/* ✅ TERMINER */}
            {!exerciseSubmitted && (
              <button
                onClick={async () => {
  let score = 0;
  const wrong: any[] = [];

  exercises.forEach((ex) => {
    if (exerciseAnswers[ex._id] === ex.correctAnswer) {
      score++;
    } else {
      wrong.push(ex);
    }
  });

  setExerciseScore(score);

  try {
    const token = localStorage.getItem("token");
    await axios.post(`${API_BASE_URL}/api/student-activity`, {
      type: "EXERCISE",
      subject: selectedMatiere,
      chapter: selectedChapter,
      score,
      totalQuestions: exercises.length,
      successRate: Math.round((score / exercises.length) * 100),
   },
          { headers: { Authorization: `Bearer ${token}` } } // ✅ Corrigé
        );
      } catch (err) {
        console.error(err);
      }

  setExerciseSubmitted(true);
  setWrongExercises(wrong);
}}
                className="mt-6 px-6 py-2 bg-green-600 text-white rounded"
              >
                ✅ Terminer
              </button>
            )}

            {/* 🎯 SCORE */}
            {exerciseSubmitted && (
              <div className="mt-4 text-center font-bold text-blue-700">
                Score : {exerciseScore} / {exercises.length} ({exerciseAttempt === 1 ? "1er essai" : `${exerciseAttempt}ème essai`})
              </div>
            )}

            {/* 🔁 REFAIRE ERREURS */}
            {exerciseSubmitted && wrongExercises.length > 0 && (
              <button
                onClick={() => {
                  setExerciseAttempt((prev) => prev + 1);
                  setExercises(wrongExercises);
                  setExerciseIndex(0);
                  setExerciseAnswers({});
                  setExerciseSubmitted(false);
                  setExerciseScore(null);
                }}
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded w-full md:w-auto"
              >
                🔁 Refaire mes erreurs
              </button>
            )}
          </div>
        );
      }

      // 👉 4) Boutons d’actions par chapitre
      if (selectedChapter) {
        const actions = [
          { label: "💡 Astuces", color: "bg-yellow-400" },
          { label: "📘 Résumé", color: "bg-blue-400" },
          { label: "🧩 Exercises", color: "bg-green-400" },
        ];

        return (
          <div className="flex flex-col items-center justify-center gap-8 mt-20">
            <h2 className="text-2xl font-bold text-gray-800">{selectedChapter}</h2>
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

      // 👉 5) Liste des chapitres
      return (
        <div className="flex flex-wrap gap-6 justify-start items-start min-h-full">
          {chapters.map((chapter, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="relative cursor-pointer rounded-2xl overflow-y-auto shadow-lg bg-white/90 hover:bg-white transition-all"
              onClick={() => setSelectedChapter(chapter)}
            >
              <img
                src={subjectImages[selectedMatiere] || mathsImg}
                alt={chapter}
                className="w-48 h-48 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-yellow-300/80 text-black text-center py-2 font-semibold">
                {chapter}
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    // Sécurité au cas où aucune condition n'est remplie
    return <StudentDashboardStats />;
  };

  // --- Layout Principal ---
  return (
    <div
      className="h-screen w-screen flex text-black overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ✅ Colonne gauche : Menu Latéral */}
      <motion.div
        className="w-1/8 bg-blue-900/40 backdrop-blur-md p-4 flex flex-col gap-8 shadow-2xl overflow-y-auto"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        {/* 🎯 QCE par concours */}
        <div>
          <h3 className="font-bold text-lg mb-3 text-yellow-200">🎯 QCE par Concours</h3>
          <button
            onClick={() => {
              resetQcm();
              setCurrentExam(null);
              setSection("concours");
              setSelectedMatiere(null);
              setSelectedChapter(null);
              setSelectedAction(null);
            }}
            className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition w-full"
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
                  resetQcm();
                  setSection("matiere");
                  setSelectedMatiere(m);
                  setSelectedChapter(null);
                  setSelectedAction(null);
                }}
                className="py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
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
                  setSelectedChapter(null);
                  setSelectedAction(null);
                }}
                className="py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ✅ Colonne centrale : Contenu */}
      <motion.div
        className="flex-1 h-full bg-white/80 backdrop-blur-md rounded-l-3xl shadow-lg p-4 overflow-y-auto relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* 🔙 Bouton Retour */}
        {section === "soutien" && (
          <button
            onClick={() => {
              if (selectedAction) return setSelectedAction(null);
              if (selectedChapter) return setSelectedChapter(null);
              if (selectedMatiere) return setSelectedMatiere(null);
              setSection("home");
            }}
            className="absolute top-4 right-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition z-10"
          >
            🔙 Retour
          </button>
        )}

        {renderCenterContent()}
      </motion.div>
    </div>
  );
}