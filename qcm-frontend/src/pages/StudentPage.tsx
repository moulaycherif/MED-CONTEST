import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "../api/axios"; 
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import katex from "katex";
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import { API_BASE_URL } from "../config";
import { fetchAstucesByChapter } from "../api/astuces.api";
import concoursImg from "../assets/CONCOURS.jfif";
import mathsImg from "../assets/MATHS.jfif";
import physiqueImg from "../assets/PHYSIQUE.jfif";
import chimieImg from "../assets/CHIMIE.jfif";
import svtImg from "../assets/SVT.jfif";
import bgImage from "/Image3.jfif";
import StudentDashboardStats from "../components/stats/StudentDashboardStats";
import StudentAstuceDetail from "./StudentAstuceDetail";
import PdfViewer from "../components/PdfViewer";
import ChemStructure from "../components/ChemStructure";
import { renderWithMath } from "../utils/mathUtils";

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
  subject?: string;
  groupId?: {
    _id: string;
    image?: string | null;
    intro?: string | null;
    order?: number;
  } | null;
  options: string[];
  reponseCorrecte: string;
  note: number;
}

export default function StudentPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState<"home" | "concours" | "matiere" | "soutien" | "qcm">("home");
  const [selectedMatiere, setSelectedMatiere] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [currentExam, setCurrentExam] = useState<string | null>(null);
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  const [exams, setExams] = useState<{ _id: string; title: string }[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  
  // États pour les exercices
  const [exercises, setExercises] = useState<any[]>([]);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState<{ [id: string]: string }>({});
  const [exerciseSubmitted, setExerciseSubmitted] = useState(false);
  const [exerciseScore, setExerciseScore] = useState<number | null>(null);
  const [wrongExercises, setWrongExercises] = useState<any[]>([]);
  const [exerciseAttempt, setExerciseAttempt] = useState(1);
  
  const [astuces, setAstuces] = useState<Astuce[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<any | null>(null);
  const [selectedTipId, setSelectedTipId] = useState<string | null>(null);
  const [selectedTip, setSelectedTip] = useState<Astuce | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  const matieres = ["Mathématique", "Physique", "Chimie", "SVT"];
  const isShortResume = (selectedResume?.chapter?.length ?? 0) < 30;

  const subjectImages: Record<string, string> = {
    Mathématique: mathsImg,
    Physique: physiqueImg,
    Chimie: chimieImg,
    SVT: svtImg,
  };

  const componentsOrder = [
    { key: "SVT", label: "Composante 1 : Sciences de la vie", coeff: 1 },
    { key: "Physique", label: "Composante 2 : Physique", coeff: 1 },
    { key: "Chimie", label: "Composante 3 : Chimie", coeff: 1 },
    { key: "Mathématique", label: "Composante 4 : Mathématiques", coeff: 1 }
  ];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedTip(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_BASE_URL}/api/questions/exams`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setExams(res.data))
      .catch((err) => console.error("❌ Exams load error", err));
  }, []);

  useEffect(() => {
    if (selectedAction !== "Résumé" || !selectedChapter) return;
    const token = localStorage.getItem("token"); 
    axios
      .get(`${API_BASE_URL}/api/resume/by-chapter/${encodeURIComponent(selectedChapter)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setResumes(res.data))
      .catch((err) => {
        console.error("❌ SUMMARY ERROR =", err);
        setResumes([]);
      });
  }, [selectedAction, selectedChapter]);

  useEffect(() => {
    if (currentExam) {
      let url = `${API_BASE_URL}/api/questions?exam=${encodeURIComponent(currentExam)}`;
      if (selectedMatiere) {
        url += `&subject=${encodeURIComponent(selectedMatiere)}`;
      }
      const token = localStorage.getItem("token");
      axios
        .get(url, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => setQuestions(res.data))
        .catch((err) => {
          console.error("❌ Erreur fetch questions:", err);
          setQuestions([]);
        });
    }
  }, [currentExam, selectedMatiere]);

  useEffect(() => {
    if (!selectedChapter) return;
    if (selectedAction === "Astuces") {
      fetchAstucesByChapter(selectedChapter)
        .then((data) => setAstuces(data as Astuce[]))
        .catch(() => setAstuces([]));
    }
  }, [selectedAction, selectedChapter]);

  // 🌟 LOGIQUE DE RÉCUPÉRATION ET REGROUPEMENT ULTRA-ROBUSTE PAR ÉNONCÉ
  useEffect(() => {
    if (selectedAction === "Exercises" && selectedChapter && selectedMatiere) {
      const token = localStorage.getItem("token");
      axios
        .get(`${API_BASE_URL}/api/exercises/${encodeURIComponent(selectedMatiere)}/${encodeURIComponent(selectedChapter)}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          const rawExercises = res.data || [];
          
          // 🧹 Nettoyage extrême pour la comparaison
          // " TEST : L'immunité " et "<p>Test: L'immunité&nbsp;</p>" deviendront tous les deux "test:l'immunité"
          const normalizeForCompare = (val?: string) => {
            if (!val) return "";
            return val
              .replace(/<[^>]*>?/gm, '') // 1. Retire toutes les balises HTML (<p>, <br>, etc.)
              .replace(/&nbsp;/gi, '')   // 2. Retire les espaces insécables HTML
              .replace(/\s+/g, '')       // 3. Retire TOUS les espaces normaux et sauts de ligne
              .toLowerCase()             // 4. Transforme tout en minuscules
              .trim();
          };

          const groupedExercises: any[] = [];
          
          rawExercises.forEach((ex: any) => {
            const exText = normalizeForCompare(ex.contextText);
            const exImg = (ex.contextImage || "").trim(); // Gère le null/undefined

            // 🔍 Recherche stricte d'un groupe existant
            const existingGroup = groupedExercises.find((g) => {
              const gText = normalizeForCompare(g.contextText);
              const gImg = (g.contextImage || "").trim();
              return gText === exText && gImg === exImg;
            });
            
            if (existingGroup) {
              // 🔄 Si on trouve un énoncé identique, on ajoute la question à la liste existante
              existingGroup.subQuestions = [
                ...existingGroup.subQuestions, 
                ...(ex.subQuestions || [])
              ];
            } else {
              // 🆕 Sinon, on crée la première page pour ce nouvel énoncé
              groupedExercises.push({ 
                ...ex, 
                subQuestions: [...(ex.subQuestions || [])] 
              });
            }
          });

          // 🐛 Ligne de debug (vous pourrez regarder F12 > Console pour vérifier que ça groupe bien)
          console.log(`Exercices bruts: ${rawExercises.length} -> Exercices regroupés: ${groupedExercises.length}`);

          setExercises(groupedExercises);
          setExerciseIndex(0);
          setExerciseAnswers({});
          setExerciseSubmitted(false);
          setExerciseScore(null);
        })
        .catch((err) => {
          console.error("❌ Erreur de récupération des exercices", err);
          setExercises([]);
        });
    }
  }, [selectedAction, selectedChapter, selectedMatiere]);

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
      .replace(/\\begin\{figure\}[\s\S]*?\\end\{figure\}/g, "")
      .replace(/\\section\*\{([^}]*)\}/g, "**$1**")
      .replace(/\\captionsetup\{[^}]*\}/g, "")
      .replace(/<\/?p>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/\\\(/g, "$")
      .replace(/\\\)/g, "$")
      .replace(/\\?below\s*\{([^}]*)\}/g, "_{$1}")
      .replace(/\\?below/g, "_")
      .replace(/\\aleph/g, "\\mathbb{N}")
      .replace(/\\rightarrow/g, "\\to")
      .replace(/lim\s*n\s*(?:-->|→|\\to)\s*(?:infini|∞)/gi, "\\(\\displaystyle \\lim_{n \\to \\infty}\\)")
      .replace(/\\lim_\{/g, "\\displaystyle \\lim_{") 
      .replace(/\\ /g, " ")
      .replace(/\\\s+/g, " ")
      .replace(/\s+/g, " ");   
  }

  function MixedContentRenderer({ text }: { text: string }) {
    if (!text) return null;
    let processedText = text;
    if (processedText.includes("<smiles>")) {
      processedText = processedText.replace(/<smiles>[\s\S]*?<\/smiles>/g, "");
    }
    if (!processedText.includes("<img")) {
      return <Latex>{cleanLatex(processedText)}</Latex>;
    }
    const imgStart = processedText.indexOf("<img");
    const imgEnd = processedText.indexOf("/>", imgStart);
    if (imgStart === -1 || imgEnd === -1) {
      return <Latex>{cleanLatex(processedText)}</Latex>;
    }
    const textBefore = processedText.substring(0, imgStart);
    const rawImgTag = processedText.substring(imgStart, imgEnd + 2);
    const textAfter = processedText.substring(imgEnd + 2);
    const srcMatch = rawImgTag.match(/src=["']([^"']+)["']/);
    const imgSrc = srcMatch ? srcMatch[1] : "";
    const classMatch = rawImgTag.match(/class=["']([^"']+)["']/);
    const imgClass = classMatch ? classMatch[1] : "max-h-24 object-contain inline-block";

    return (
      <div className="flex flex-col sm:flex-row sm:items-center items-start gap-3 w-full my-1 flex-wrap text-justify">
        {textBefore.trim().length > 0 && (
          <span className="text-gray-800 font-medium text-justify block w-full">
            <Latex>{cleanLatex(textBefore)}</Latex>
          </span>
        )}
        {imgSrc && (
          <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm transition-transform hover:scale-105 inline-block">
            <img src={imgSrc} alt="Illustration" className={`${imgClass} rounded`} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }}/>
          </div>
        )}
        {textAfter.trim().length > 0 && (
          <span className="text-gray-600 text-sm text-justify block w-full">
            <Latex>{cleanLatex(textAfter)}</Latex>
          </span>
        )}
      </div>
    );
  }

  function renderContent(content?: string) {
    if (!content) return null;
    return (
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{
          __html: cleanLatex(content),
        }}
      />
    );
  }

  const getImageUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleFinish = async () => {
    if (!currentExamId) return;

    let total = 0;
    questions.forEach((q) => {
      if (answers[q._id] === q.reponseCorrecte) {
        total += q.note;
      }
    });

    const totalPossiblePoints = questions.reduce((sum, q) => sum + q.note, 0);
    const totalQuestions = questions.length;
    const successRate = totalPossiblePoints > 0 ? Math.round((total / totalPossiblePoints) * 100) : 0;
    
    setScore(total);
    setSubmitted(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/student/exams/${currentExamId}/submit`,
        { answers, subject: selectedMatiere || "CONCOURS" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.post(
        `${API_BASE_URL}/api/student-activity`,
        {
          type: "QCM",
          subject: selectedMatiere || "CONCOURS",
          chapter: currentExam,
          referenceId: currentExamId,
          score: total,
          totalQuestions,
          successRate,
          examId: currentExamId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("❌ Erreur enregistrement QCM", err);
    }
  };

  const renderCenterContent = () => {
    if (selectedTipId) {
      return <StudentAstuceDetail id={selectedTipId} onBack={() => setSelectedTipId(null)} />;
    }
    
    if (section === "home") {
      return <StudentDashboardStats />;
    }
    
    // 🧩 Cas 1 : QCE par Concours / Matière
    if (section === "qcm" && currentExam) {
      if (questions.length === 0) {
        return (
          <div className="text-center mt-10">
            <p className="text-gray-700 text-lg">Aucune question trouvée pour {currentExam}.</p>
          </div>
        );
      }

      const renderingBlocks = !selectedMatiere 
        ? componentsOrder.map(comp => {
            const compsQuestions = questions
              .map((q, originalIdx) => ({ q, originalIdx }))
              .filter(item => item.q.subject?.toLowerCase().startsWith(comp.key.toLowerCase().substring(0, 4)));
            return { ...comp, items: compsQuestions };
          }).filter(block => block.items.length > 0)
        : [{ label: `Questions pour la matière : ${selectedMatiere}`, coeff: null, items: questions.map((q, originalIdx) => ({ q, originalIdx })) }];

      let lastGroupId: string | null = null;

      return (
        <div className="p-4">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-900 border-b pb-2">📘 QCE — {currentExam}</h2>
          
          {renderingBlocks.map((block, bIdx) => (
            <div key={bIdx} className="mb-8">
              <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white px-4 py-3 rounded-xl font-bold shadow-md mb-4 flex justify-between items-center text-md md:text-lg">
                <span>{block.label}</span>
                {block.coeff !== null && (
                  <span className="bg-white/20 text-yellow-300 px-3 py-1 rounded-full text-sm">
                    Coefficient : {block.coeff}
                  </span>
                )}
              </div>

              {block.items.map(({ q, originalIdx }) => {
                const isNewGroup = q.groupId?._id && q.groupId._id !== lastGroupId;
                if (q.groupId?._id) {
                  lastGroupId = q.groupId._id;
                }

                return (
                  <motion.div
                    key={q._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 mb-5 bg-white rounded-xl border-2 border-gray-950 shadow-sm"
                  >
                    {q.groupId?._id && isNewGroup && (
                      <div className="mb-6 p-4 bg-gray-50 border-l-4 border-blue-500 rounded-r-xl shadow-sm">
                        {q.groupId?.intro && (
                          <div className="text-gray-700 font-medium text-lg mb-4 italic w-full">
                            <MixedContentRenderer text={q.groupId.intro} />
                          </div>
                        )}
                        {q.groupId?.image && (
                          <img
                            src={getImageUrl(q.groupId.image)}
                            className="max-w-lg mx-auto my-2 rounded shadow block object-contain max-h-[300px]"
                            alt="Illustration du groupe"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                      </div>
                    )}

                    <h3 className="font-semibold mb-3 text-lg mt-1 flex items-start gap-1">
                      <span className="text-blue-900 font-bold">Q{originalIdx + 1}) </span>
                      <div className="flex-1">
                        <MixedContentRenderer text={q.texte || ""} />
                      </div>
                      <span className="text-purple-700 shrink-0 text-sm bg-purple-50 px-2 py-0.5 rounded-full font-medium">({q.note} pt)</span>
                    </h3>

                    {(!q.groupId || !q.groupId._id) && q.image && (
                      <img
                        src={getImageUrl(q.image)}
                        className="max-w-lg my-3 rounded shadow mx-auto block object-contain max-h-[300px]"
                        alt="Illustration"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    
                    <div className="space-y-2 mt-3">
                      {q.options.map((opt, i) => {
                        return (
                          <label
                            key={i}
                            className={`flex items-start p-3 border-2 border-gray-300 rounded-lg cursor-pointer transition-all ${
                              submitted
                                ? opt === q.reponseCorrecte
                                  ? "bg-green-100 !border-green-500 font-medium"
                                  : answers[q._id] === opt
                                  ? "bg-red-100 !border-red-500 font-medium"
                                  : "opacity-60"
                                : "hover:bg-blue-50/50 hover:border-blue-400"
                            }`}
                          >
                            <input
                              type="radio"
                              name={q._id}
                              checked={answers[q._id] === opt}
                              onChange={() => handleAnswerChange(q._id, opt)}
                              disabled={submitted}
                              className="mt-1 mr-3 shrink-0 accent-blue-800"
                            />
                            <div className="flex-1 w-full text-gray-900 font-normal">
                              <MixedContentRenderer text={opt} />
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}

          {!submitted ? (
            <div className="text-center mt-6">
              <button
                onClick={handleFinish}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700 transition transform hover:scale-102"
              >
                ✅ Soumettre le sujet complet
              </button>
            </div>
          ) : (
            <div className="mt-6 text-center text-xl font-bold text-blue-800 bg-blue-50 border border-blue-200 py-3 rounded-xl max-w-md mx-auto shadow-sm">
              🏁 Score total du concours : {score} / {questions.reduce((sum, q) => sum + q.note, 0)}
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
              className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/90 hover:bg-white transition-all"
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
      const matiereImage = subjectImages[selectedMatiere];
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
              className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/90 hover:bg-white transition-all w-48 h-48 shrink-0"
              onClick={() => {
                resetQcm();
                setSection("qcm");
                setCurrentExam(exam.title);
                setCurrentExamId(exam._id);
              }}
            >
              <img src={matiereImage} alt={`${selectedMatiere} — ${exam.title}`} className="w-full h-full object-cover" />
              <div
                className="absolute bottom-0 left-0 right-0 bg-green-700/75 text-white text-center px-1 py-1.5 font-medium text-[10px] leading-tight max-h-[44px] flex items-center justify-center overflow-hidden"
                title={`${selectedMatiere} — ${exam.title}`}
              >
                <span className="line-clamp-2 break-words">
                  {selectedMatiere} — {exam.title}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      );
    }

    // 🧩 Cas 4 : Soutien
    if (section === "soutien" && selectedMatiere) {
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
        SVT: [
          "Chapitre 1 : Les réactions responsables de la libération de l'énergie emmagasinée dans la matière organique",
          "Chapitre 2 : Rôle du muscle strié squelettique dans la conversion de l'énergie",
          "Chapitre 3 : L'information génétique",
          "Chapitre 4 : Le génie génétique",
          "Chapitre 5 : La génétique humaine",
          "Chapitre 6 : La génétique des populations",
          "Chapitre 7 : L'immunité"
        ],
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
                        }, { headers: { Authorization: `Bearer ${token}` } });
                      } catch (err) { console.error(err); }
                    }}
                    className="px-5 py-2 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 shadow transition"
                  >
                    {tip.title}
                  </motion.button>
                ))}
              </div>
            )}

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
                    onClick={() => { setSelectedTip(null); setFocusMode(false); }}
                    className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
                  >
                    ✖
                  </button>
                  <h2 className="text-2xl font-bold mb-4 text-center">{selectedTip.title}</h2>
                  {selectedTip?.pdfUrl && <PdfViewer key={selectedTip._id} url={selectedTip?.pdfUrl} />}
                  {!selectedTip.pdfUrl &&
                    selectedTip.cases?.map((c, i) => (
                      <div key={i} className="mb-8 overflow-y-auto max-h-[60vh]">
                        {c.title && <h3 className="font-semibold text-lg mb-2 text-indigo-700">{c.title}</h3>}
                        {c.image && (
                          <div className="flex justify-center mb-4">
                            <img 
                              src={c.image} 
                              className="max-h-72 object-contain rounded-xl shadow mx-auto" 
                              alt={c.title} 
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
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
                      setSelectedResume(sum);
                      try {
                        const token = localStorage.getItem("token");
                        await axios.post(`${API_BASE_URL}/api/student-activity`, {
                          type: "RESUME",
                          subject: selectedMatiere,
                          chapter: selectedChapter,
                          referenceId: sum._id,
                        }, { headers: { Authorization: `Bearer ${token}` } });
                      } catch (err) { console.error(err); }
                    }}
                    className="px-5 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 shadow"
                  >
                    {sum.chapter}
                  </button>
                ))}
              </div>
            )}

            {selectedResume && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedResume(null)}>
                <div onClick={(e) => e.stopPropagation()} className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl ${isShortResume ? "max-h-[55vh]" : "max-h-[75vh]"} flex flex-col`}>
                  <h2 className="text-lg font-bold p-3 text-center border-b">{selectedResume.chapter}</h2>
                  <div className="flex-1 overflow-y-auto p-2">
                    <iframe src={selectedResume.pdfUrl + "#toolbar=0"} className="w-full h-full min-h-[300px] rounded-b-2xl" title="Résumé PDF" />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      // 👉 3) EXERCICES
      if (selectedChapter && selectedAction === "Exercises") {
        const currentEx = exercises[exerciseIndex];
        if (exercises.length === 0) {
          return <p className="text-center mt-10">Aucun exercice trouvé</p>;
        }

        // Calcul du vrai nombre de questions pour l'affichage des stats
        const totalQuestionsCount = exercises.reduce((acc, ex) => acc + (ex.subQuestions?.length || 0), 0);

        const processQuillText = (text?: string) => {
          if (!text) return "";
          return text
            .replace(/\\?below\s*\{/g, "_{")
            .replace(/\\?below/g, "_")
            .replace(/lim\s*n\s*(?:--&gt;|-->|→)\s*(?:infini|∞)/gi, '<span class="ql-formula" data-value="\\displaystyle \\lim_{n \\to \\infty}"></span>')
            .replace(/data-value="\\lim_/g, 'data-value="\\displaystyle \\lim_');
        };

        return (
          <div className="p-6 exercice-view-container">
            <style>{`
              .exercice-view-container img, .ql-editor img {
                max-height: 260px !important;
                width: auto !important;
                max-width: 100% !important;
                margin: 0 auto;
                display: block;
                object-fit: contain;
                border-radius: 8px;
              }
            `}</style>
            
            <div className="mb-4 text-center">
              <p className="font-semibold text-gray-600">
                Énoncé {exerciseIndex + 1} / {exercises.length} <span className="text-sm font-normal">(Total : {totalQuestionsCount} questions)</span>
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow border-t-4 border-blue-600">
              
              <div className="mb-4 border-b pb-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wide">Énoncé</h3>
                <div className="text-base [&_.ql-editor]:p-0 [&_.ql-editor]:text-base [&_.ql-editor]:leading-snug [&_.ql-editor_p]:mb-1">
                  <ReactQuill value={processQuillText(currentEx.contextText)} readOnly={true} theme="bubble" />
                </div>
                {currentEx.contextImage && (
                  <img 
                    src={getImageUrl(currentEx.contextImage)} 
                    alt="Contexte" 
                    className="mt-2 mx-auto block object-contain max-h-[150px]" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>
              
              <div className="space-y-6">
                {currentEx.subQuestions?.map((subQ: any, index: number) => (
                  <div key={subQ._id} className="pl-2 border-l-2 border-blue-200 py-1">
                    
                    <div className="font-medium mb-2 flex flex-col items-start text-lg leading-relaxed">
                      
                      <div className="flex items-start w-full">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[12px] mr-2 mt-0.5 shrink-0 font-bold">
                          Q{index + 1}
                        </span>
                        <div className="flex-1 text-lg [&_.ql-editor]:p-0 [&_.ql-editor]:min-h-0 [&_.ql-editor]:text-lg [&_.ql-editor]:leading-relaxed [&_.ql-editor]:font-medium [&_.ql-editor_p]:my-1">
                          <ReactQuill value={processQuillText(subQ.questionText)} readOnly={true} theme="bubble" />
                        </div>
                      </div>

                      {subQ.image && (
                        <div className="mt-3 w-full">
                          <img 
                            src={subQ.image.startsWith('/') ? subQ.image : `/images/${subQ.image}`} 
                            alt="Illustration de question" 
                            className="max-h-[200px] object-contain mx-auto block rounded-lg shadow-sm border border-gray-100"
                            onError={(e) => { 
                              console.error("Image non trouvée :", e.currentTarget.src);
                              e.currentTarget.style.display = 'none'; 
                            }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {subQ.options.map((opt: string, i: number) => {
                        const isSelected = exerciseAnswers[subQ._id] === opt;
                        const isCorrect = opt === subQ.correctAnswer;
                        return (
                          <label key={i} className={`flex items-start px-3 py-2 border rounded-md cursor-pointer text-base transition-all leading-snug ${exerciseSubmitted ? isSelected && isCorrect ? "bg-green-100 border-green-500 shadow-sm" : isSelected && !isCorrect ? "bg-red-100 border-red-500 shadow-sm" : isCorrect ? "bg-green-50 border-green-300 border-dashed" : "bg-gray-50 opacity-50" : "hover:bg-blue-50 border-gray-200"}`}>
                            <input type="radio" checked={isSelected} disabled={exerciseSubmitted} onChange={() => setExerciseAnswers((prev) => ({ ...prev, [subQ._id]: opt }))} className="mt-1 mr-3 shrink-0" />
                            <div className="flex-1 w-full">
                              <MixedContentRenderer text={opt} />
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    
                    {exerciseSubmitted && exerciseAnswers[subQ._id] !== subQ.correctAnswer && (
                      <div className="ml-8 mt-2 px-3 py-2 bg-blue-50 text-blue-800 rounded-md border border-blue-100 text-sm">  
                        <span className="font-bold flex items-center mb-1">💡 Correction :</span>
                        <div className="prose max-w-none text-gray-800">{renderWithMath(subQ.explanation)}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <button onClick={() => setExerciseIndex((i) => i - 1)} disabled={exerciseIndex === 0} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 font-semibold">⬅️ Énoncé Précédent</button>
              <button onClick={() => setExerciseIndex((i) => i + 1)} disabled={exerciseIndex === Math.max(0, exercises.length - 1)} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 font-semibold">Énoncé Suivant ➡️</button>
            </div>
            
            {!exerciseSubmitted && (
              <button
                onClick={async () => {
                  let score = 0;
                  let totalQ = 0;
                  exercises.forEach((ex) => {
                    ex.subQuestions?.forEach((subQ: any) => {
                      totalQ++;
                      if (exerciseAnswers[subQ._id] === subQ.correctAnswer) { score++; }
                    });
                  });
                  // Garder dans wrongExercises les énoncés complets si l'étudiant a fait au moins une erreur dessus
                  const wrong = exercises.filter((ex) => ex.subQuestions?.some((subQ: any) => exerciseAnswers[subQ._id] !== subQ.correctAnswer));
                  setExerciseScore(score);
                  try {
                    const token = localStorage.getItem("token");
                    await axios.post(`${API_BASE_URL}/api/student-activity`, {
                      type: "EXERCISE",
                      subject: selectedMatiere,
                      chapter: selectedChapter,
                      score,
                      totalQuestions: totalQ,
                      successRate: totalQ > 0 ? Math.round((score / totalQ) * 100) : 0,
                    }, { headers: { Authorization: `Bearer ${token}` } });
                  } catch (err) { console.error(err); }
                  setExerciseSubmitted(true); setWrongExercises(wrong);
                }}
                className="mt-6 px-6 py-2 bg-green-600 text-white rounded font-bold w-full md:w-auto shadow"
              >
                ✅ Valider ce chapitre
              </button>
            )}

            {exerciseSubmitted && (
              <div className="mt-4 text-center font-bold text-blue-700 bg-blue-50 py-3 rounded-lg border border-blue-200">
                Score : {exerciseScore} / {totalQuestionsCount} ({exerciseAttempt === 1 ? "1er essai" : `${exerciseAttempt}ème essai`})
              </div>
            )}
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
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded w-full md:w-auto font-bold shadow"
              >
                🔁 Refaire uniquement les énoncés avec erreurs
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
            <h2 className="text-2xl font-bold text-gray-800 text-center max-w-2xl px-4">{selectedChapter}</h2>
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
        <div className="flex flex-wrap gap-6 justify-start items-start min-h-full p-4">
          {chapters.map((chapter, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="w-48 cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100 flex flex-col transition-all"
              onClick={() => setSelectedChapter(chapter)}
            >
              <div className="w-48 h-48 bg-gray-50 shrink-0 overflow-hidden">
                <img 
                  src={(selectedMatiere && subjectImages[selectedMatiere]) || mathsImg} 
                  alt={chapter} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div 
                className="bg-yellow-300 text-black text-center p-2 font-semibold text-xs flex items-center justify-center h-16 min-w-0"
                title={chapter}
              >
                <span className="line-clamp-3 break-words leading-tight">
                  {chapter}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      );
    }
    return <StudentDashboardStats />;
  };

  return (
    <div
      className="h-screen w-screen flex text-black overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Menu Latéral */}
      <motion.div
        className="w-1/8 bg-blue-900/40 backdrop-blur-md p-4 flex flex-col gap-8 shadow-2xl overflow-y-auto"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <div>
          <h3 className="font-bold text-lg mb-3 text-yellow-200">🎯 QCE par Concours</h3>
          <button
            onClick={() => {
              resetQcm();
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

      {/* Contenu Central */}
      <motion.div
        className="flex-1 h-full bg-white/80 backdrop-blur-md rounded-l-3xl shadow-lg p-4 overflow-y-auto relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {(section !== "home" || selectedMatiere || selectedChapter || selectedAction) && (
          <button
            onClick={() => {
              if (selectedAction) return setSelectedAction(null);
              if (selectedChapter) return setSelectedChapter(null);
              if (selectedMatiere) return setSelectedMatiere(null);
              resetQcm();
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