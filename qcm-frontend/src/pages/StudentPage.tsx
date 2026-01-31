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
import { fetchAstucesByChapter, Astuce } from "../api/astuces.api";
import StudentSummaries from "./StudentSummaries";
import StudentDashboardStats from "../components/stats/StudentDashboardStats";

interface Question {
  _id: string;
  texte?: string;
  image?: string | null;
  options: string[];
  reponseCorrecte: string;
  note: number;
}


export default function StudentPage() {
  // Navigation
  
  const [section, setSection] = useState<"home" | "concours" | "matiere" | "soutien" | "qcm">("home");


   // Sélections
  const [selectedMatiere, setSelectedMatiere] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [currentExam, setCurrentExam] = useState<string | null>(null);
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);


  // QCM
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Astuces
  const [astuces, setAstuces] = useState<Astuce[]>([]);
  const matieres = ["Mathématique", "Physique", "Chimie", "SVT"];

  const chapterMaths = [
    "Chapitre I : Suites & Sommes",
    "Chapitre II : Limites, Continuité & Dérivabilité",
    "Chapitre III : Étude de fonctions",
    "Chapitre IV : Nombres complexes",
    "Chapitre V : Intégrales",
    "Chapitre VI : Géométrie dans l'espace",
    "Chapitre VII : Probabilité",
  ];

  const resetQcm = () => {
  setCurrentExam(null);
  setCurrentExamId(null);   // 🔥
  setQuestions([]);
  setAnswers({});
  setSubmitted(false);
  setScore(null);
};

const [exams, setExams] = useState<{ _id: string; title: string }[]>([]);

useEffect(() => {
  axios
    .get(`${API_BASE_URL}/api/questions/exams`)
    .then(res => {
      setExams(res.data); // [{_id,title,subject}]
      
    })
    .catch(err => console.error("❌ Exams load error", err));
}, []);

  // 🔹 Charger les questions quand currentExam change
  useEffect(() => {
  if (currentExam) {
    let url = `${API_BASE_URL}/api/questions?exam=${encodeURIComponent(currentExam)}`;
    if (selectedMatiere) {
      url += `&subject=${encodeURIComponent(selectedMatiere)}`;
    }

    axios
      .get(url)
      .then((res) => {
        
        setQuestions(res.data);
      })
      .catch((err) => {
        console.error("❌ Erreur fetch questions:", err);
        setQuestions([]);
      });
  }
}, [currentExam, selectedMatiere]);


  // Charger les astuces quand on clique sur le bouton "Astuces"
useEffect(() => {
  if (selectedAction === "Astuces" && selectedChapter) {
    axios
      .get(`${API_BASE_URL}/api/astuces/${encodeURIComponent(selectedChapter)}`)
      .then((res) => setAstuces(res.data))
      .catch(() => setAstuces([]));
  }
}, [selectedAction, selectedChapter]);

useEffect(() => {
  if (selectedAction === "Astuces" && selectedChapter) {
    fetchAstucesByChapter(selectedChapter)
      .then((data) => setAstuces(data))
      .catch(() => setAstuces([]));
  }
}, [selectedAction, selectedChapter]);

  // 🔹 Changement de réponse
  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  // 🔹 Correction locale
  const handleFinish = async () => {
    if (!currentExamId) {
  console.error("❌ ExamId manquant");
  return;
}

  let total = 0;
  questions.forEach((q) => {
    if (answers[q._id] === q.reponseCorrecte) total += q.note;
  });

  setScore(total);
  setSubmitted(true);

  try {
    const token = localStorage.getItem("token");

    await axios.post(
  `${API_BASE_URL}/api/student/exams/${currentExamId}/submit`,
  {
    answers,
    subject: selectedMatiere || "CONCOURS"   // 🔥 IMPORTANT
  },
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);


    
  } catch (err) {
    console.error("❌ Erreur enregistrement QCM", err);
  }
};


  // --- Rendu principal ---
  const renderCenterContent = () => {

   // 🏠 PAGE D’ACCUEIL → STATISTIQUES UNIQUEMENT
    
    if (section === null) {
      return <StudentDashboardStats />;
    }

    // 🧩 Cas 1 : affichage des questions (QCE)
    if (section === "qcm" && currentExam) {
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
  Q{idx + 1}){" "}
  {q.texte && <span>{q.texte}</span>}
  <span className="text-purple-600"> ({q.note} pt)</span>
</h3>

{/* 🖼 IMAGE (groupe ou question) */}

console.log("STUDENTPAGE :",q as any, q.image, (q as any).groupId?.image);


{(q as any).groupId?.image || q.image ? (
  <img
    src={`${API_BASE_URL}${(q as any).groupId?.image || q.image}`}
    className="max-w-lg my-3 rounded shadow"
    alt="Illustration"
  />
) : null}



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
                setCurrentExam(exam.title);     // "MEDECINE 2023"
                setCurrentExamId(exam._id);     // 🔥 ID Mongo
              }}

            >
              <img src={concoursImg} className="w-48 h-48 object-cover" />
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

  // on récupère les examens existants (MEDECINE 2025, 2024, 2023)
  const filteredExams = exams.filter(e =>
    e.title.startsWith("MEDECINE")
  );

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
          className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/90 hover:bg-white transition-all"
          onClick={() => {
            resetQcm();
            setSection("qcm");
            setCurrentExam(exam.title);   // 🔥 MEDECINE 2024
            setCurrentExamId(exam._id);   // 🔥 vrai ID Mongo
          }}
        >
          <img
            src={matiereImage}
            alt={`${selectedMatiere} — ${exam.title}`}
            className="w-48 h-48 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-green-700/60 text-black text-center py-2 font-semibold">
            {selectedMatiere} — {exam.title}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}


// 🧩 Cas 4 : Soutien — TOUTES LES MATIÈRES

const subjectImages: Record<string, string> = {
  Mathématique: mathsImg,
  Physique: physiqueImg,
  Chimie: chimieImg,
  SVT: svtImg,
};

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
      "Chapitre I : Génétique",
      "Chapitre II : Immunologie",
      "Chapitre III : Métabolisme"
    ],
  };

  const chapters = chaptersBySubject[selectedMatiere] || [];

  // 👉 1) ASTUCES
  if (selectedChapter && selectedAction === "Astuces") {
    return (
      <div className="p-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          💡 {selectedChapter} — Astuces
        </h2>

        {astuces.length === 0 ? (
          <p className="text-center text-gray-500">Aucune astuce trouvée…</p>
        ) : (
          <AnimatedQaViewer qas={astuces} />
        )}
      </div>
    );
  }

  // 👉 2) RÉSUMÉS
  if (selectedChapter && selectedAction === "Résumé") {
    return (
      <div className="p-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          📘 Résumés {selectedMatiere} - {selectedChapter}
        </h2>

        <StudentSummaries selectedSubject={selectedMatiere} selectedChapter={selectedChapter} />
      </div>
    );
  }

  // 👉 3) EXERCICES (placeholders)
  if (selectedChapter && selectedAction === "Exercices") {
    return (
      <div className="p-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          🧩 {selectedChapter} — Exercices
        </h2>
        <p className="text-center text-gray-600">
          Exercices à venir…
        </p>
      </div>
    );
  }

  // 👉 4) Boutons d’actions
  if (selectedChapter) {
    const actions = [
      { label: "💡 Astuces", color: "bg-yellow-400" },
      { label: "📘 Résumé", color: "bg-blue-400" },
      { label: "🧩 Exercices", color: "bg-green-400" },
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
              onClick={() =>
                setSelectedAction(action.label.replace(/[💡📘🧩]/g, "").trim())
              }
              className={`${action.color} text-black font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-2xl transition`}
            >
              {action.label}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // 👉 5) Liste des chapitres selon la matière
  return (
    <div className="flex flex-wrap gap-6 justify-start items-start min-h-full">
      {chapters.map((chapter, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05 }}
          className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white/90 hover:bg-white transition-all"
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


// 🧩 PAR DÉFAUT → STATISTIQUES (HOME)
 return (
   <div className="p-6">
     <StudentDashboardStats />
   </div>
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
              resetQcm();
          // 🔥 Sortir du QCM
            setCurrentExam(null);

          // 🔥 Reset du QCM (défige)
           resetQcm();

          // 🔥 Aller à la liste des concours
            setSection("concours");

          // Reset autres vues
            setSelectedMatiere(null);
            setSelectedChapter(null);
            setSelectedAction(null);
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
                  resetQcm();
                setSection("matiere");
                setSelectedMatiere(m);
                setSelectedChapter(null);
                setSelectedAction(null);
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
                setSelectedChapter(null);
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
        className="flex-1 h-full bg-white/80 backdrop-blur-md rounded-l-3xl shadow-lg p-4 overflow-y-auto relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* 🔙 Bouton Retour en haut à droite */}
       
        {section === "soutien" && (
  <button
    onClick={() => {
      // Niveau 4 → 3 (PDF, Astuces, Exercices)
      if (selectedAction) {
        setSelectedAction(null);
        return;
      }

      // Niveau 3 → 2 (boutons)
      if (selectedChapter) {
        setSelectedChapter(null);
        return;
      }

      // Niveau 2 → 1 (chapitres → matières)
      if (selectedMatiere) {
        setSelectedMatiere(null);
        return;
      }

      // Niveau 1 → Home
      setSection("home");
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
