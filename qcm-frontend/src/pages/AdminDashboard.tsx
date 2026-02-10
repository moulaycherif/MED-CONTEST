// src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import SummaryList from "./SummaryList";
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// Déconnexion
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("studentToken");
  document.cookie.split(";").forEach(function (c) {
    document.cookie =
      c.trim().split("=")[0] +
      "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  });
  window.location.href = "/";
}

interface Student {
  _id: string;
  name: string;
  email: string;
}

const AdminDashboard: React.FC = () => {
  
  // Résumés
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [resumeContent, setResumeContent] = useState("");
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);

  const [uploadPdfFile, setUploadPdfFile] = useState<File | null>(null);
  const [creationMode, setCreationMode] = useState<"text" | "upload">("text");

   // Onglets
  const [activeTab, setActiveTab] = useState<
    "students" | "import" | "summary"
  >("students");

  // Étudiants
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  
  // Définition de ImportResult et Exam
  interface ImportResult {
  question: string;
  status: string;
  details?: string[];
}
interface Exam {
  _id: string;
  title: string;
}

const [exams, setExams] = useState<Exam[]>([]);

  // Import
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"append" | "replace" | "replace-global">("append");
  const [importMessage, setImportMessage] = useState<string>("");
  const [details, setDetails] = useState<ImportResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExam, setSelectedExam] = useState<string>("");

  const token = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");
  const itemsPerPage = 10;

  // ===============================================
  // 📘 SECTION : ÉTUDIANTS
  // ===============================================

  // Chargement étudiants
  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    } catch (err) {
      console.error("❌ Erreur récupération étudiants :", err);
      setMessage("Erreur récupération étudiants");
    }
  };

  // Création étudiant
const handleCreateStudent = async () => {
  if (!name || !email || !password) {
    setMessage("⚠️ Veuillez remplir tous les champs");
    return;
  }

  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/admin/create-student`,
      { name, email, password },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMessage("✅ Étudiant ajouté avec succès");
    setName("");
    setEmail("");
    setPassword("");
    fetchStudents();
  } catch (err: any) {
    console.error("❌ Création étudiant :", err);

    if (err.response?.status === 401) {
      setMessage("⛔ Session expirée. Veuillez vous reconnecter.");
    } else {
      setMessage(err.response?.data?.message || "Erreur création étudiant");
    }
  }
};

  // Supprimer étudiant
  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Supprimer cet étudiant ?")) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/admin/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message);
      fetchStudents();
    } catch (err) {
      console.error("❌ Erreur suppression étudiant :", err);
      setMessage("Erreur suppression étudiant");
    }
  };

  // ===============================================
  // 📘 SECTION : IMPORT DES QUESTIONS
  // ===============================================

  // Chargement examens
  const fetchExams = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/questions/exams`);
      setExams(res.data);
    } catch (err) {
      console.error("Erreur récupération examens :", err);
    }
  };

  // Import Excel
  const handleUpload = async () => {
    if (!file) {
      setImportMessage("⚠️ Veuillez choisir un fichier Excel");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/questions/import?mode=${mode}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setImportMessage(res.data.message || "✅ Import réussi");
      setDetails(res.data.details || []);
      setCurrentPage(1);
      fetchExams();
    } catch (error: any) {
      console.error("❌ Erreur import :", error.response?.data || error.message);
      setImportMessage("❌ Erreur lors de l'import");
      setDetails([]);
    }
  };

  useEffect(() => {
    if (activeTab === "students") fetchStudents();
    else fetchExams();
  }, [activeTab]);

  const totalPages = Math.ceil(details.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = details.slice(startIndex, startIndex + itemsPerPage);

  // ----------------------------------------------
  // 🔥 Système complet pour créer un résumé
  // ----------------------------------------------

  const createResumeFromText = async () => {
    if (!subject || !chapter || !resumeContent) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/resume/generate`, {
        subject,
        chapter,
        content: resumeContent,
      }, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });

      const finalUrl = res.data?.pdfUrl || res.data?.url;
      if (!finalUrl) return alert("Erreur : URL manquante.");

      setGeneratedPdf(finalUrl);
      alert(res.data?.alreadyExists ? "Résumé déjà existant, URL renvoyée." : "PDF généré et uploadé !");
      // informer les listes pour rafraîchir
      window.dispatchEvent(new Event("resumesUpdated"));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération.");
    }
  };

  const createResumeFromUpload = async () => {
  if (!subject || !chapter || !uploadPdfFile) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", uploadPdfFile);
    formData.append("subject", subject);
    formData.append("chapter", chapter);

    const res = await axios.post(
      `${API_BASE_URL}/api/resume/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data", Authorization: token ? `Bearer ${token}` : undefined } }
    );

    const finalUrl = res.data?.pdfUrl || res.data?.url;

    if (!finalUrl) {
      alert("Erreur : URL non reçue après upload.");
      return;
    }

    setGeneratedPdf(finalUrl);
    alert(res.data?.alreadyExists ? "Le PDF existe déjà (URL récupérée)." : "PDF uploadé avec succès !");
    window.dispatchEvent(new Event("resumesUpdated"));

  } catch (err) {
    console.error(err);
    alert("Erreur upload PDF.");
  }
};


  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* header / onglets (inchangés) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center flex-1">
          👩‍🏫 Tableau de bord Enseignant
        </h1>

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          🚪 Déconnexion
        </button>
      </div>

      {/* onglets (simplifié pour la démonstration) */}
      <div className="flex justify-center gap-4 mb-8">
        <button onClick={() => setActiveTab("students")} className={`px-4 py-2 rounded ${activeTab === "students" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>🧑‍🎓 Gestion des étudiants</button>
        <button onClick={() => setActiveTab("import")} className={`px-4 py-2 rounded ${activeTab === "import" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>📂 Import Questions</button>
        <button onClick={() => setActiveTab("summary")} className={`px-4 py-2 rounded ${activeTab === "summary" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>📝 Gestion des résumés</button>
      </div>

      {/* ----------- Onglet Étudiants ----------- */}
      {activeTab === "students" && (
        <div>
          <div className="mb-6 p-4 border rounded shadow-sm flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Nom"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border px-2 py-1 rounded text-black flex-1"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border px-2 py-1 rounded text-black flex-1"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="border px-2 py-1 rounded text-black flex-1"
            />
            <button
              onClick={handleCreateStudent}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Ajouter
            </button>
          </div>

          {message && <p className="mb-4 font-semibold">{message}</p>}

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-2 py-1">Nom</th>
                  <th className="border px-2 py-1">Email</th>
                  <th className="border px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id} className="text-sm">
                    <td className="border px-2 py-1">{s.name}</td>
                    <td className="border px-2 py-1">{s.email}</td>
                    <td className="border px-2 py-1 flex gap-2">
                      <button
                        onClick={() => handleDeleteStudent(s._id)}
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------- Onglet Import ----------- */}
      {activeTab === "import" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">📂 Importer des questions</h2>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="mb-4"
          />

          <div className="mb-4">
            <label className="mr-4">
              <input
                type="radio"
                value="append"
                checked={mode === "append"}
                onChange={() => setMode("append")}
              />{" "}
              Ajouter (append)
            </label>
            <label className="mr-4">
              <input
                type="radio"
                value="replace"
                checked={mode === "replace"}
                onChange={() => setMode("replace")}
              />{" "}
              Remplacer (replace)
            </label>
            <label>
              <input
                type="radio"
                value="replace-global"
                checked={mode === "replace-global"}
                onChange={() => setMode("replace-global")}
              />{" "}
              Remplacer global
            </label>
          </div>

          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
          >
            Importer
          </button>

          {importMessage && <p className="mt-4 font-semibold">{importMessage}</p>}

          <div className="mt-4">
            <label className="font-semibold mr-2">Examens disponibles :</label>
            <select
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
              className="border px-2 py-1"
            >
              <option value="">-- Choisir un examen --</option>
              {exams.map(exam => (
  <option key={exam._id} value={exam.title}>
    {exam.title}
  </option>
))}

            </select>
          </div>

          {details.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-2">📊 Détails de l'import</h2>
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border px-2 py-1">Question</th>
                    <th className="border px-2 py-1">Statut</th>
                    <th className="border px-2 py-1">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((d, idx) => (
                    <tr key={idx} className="text-sm">
                      <td className="border px-2 py-1">{d.question}</td>
                      <td className="border px-2 py-1">{d.status}</td>
                      <td className="border px-2 py-1">
                        {d.details ? d.details.join(", ") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center mt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  ⬅️ Précédent
                </button>
                <span>
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Suivant ➡️
                </button>
              </div>
            </div>
          )}
        </div>
      )}

   {/* ----------- Onglet Summary ----------- */}
{activeTab === "summary" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">📝 Gestion des résumés</h2>

          <SummaryList />

          <hr className="my-6" />

          <h3 className="text-xl font-bold mb-4">➕ Créer un résumé PDF</h3>

          <div className="mb-4">
            <label className="mr-4">
              <input type="radio" checked={creationMode === "text"} onChange={() => setCreationMode("text")} /> Saisir contenu (générer PDF)
            </label>
            <label className="ml-4">
              <input type="radio" checked={creationMode === "upload"} onChange={() => setCreationMode("upload")} /> Importer un PDF existant
            </label>
          </div>

          <div className="mb-4">
            <label className="font-semibold">Matière :</label>
            <input type="text" className="border px-2 py-1 ml-2" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="mb-4">
            <label className="font-semibold">Chapter :</label>
            <input type="text" className="border px-2 py-1 ml-2" value={chapter} onChange={(e) => setChapter(e.target.value)} />
          </div>

          {creationMode === "text" && (
            <>
              <textarea placeholder="Contenu du résumé..." className="border w-full h-60 p-3" value={resumeContent} onChange={(e) => setResumeContent(e.target.value)} />
              <button onClick={createResumeFromText} className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700">📄 Générer PDF</button>
            </>
          )}

          {creationMode === "upload" && (
            <>
              <input type="file" accept="application/pdf" onChange={(e) => setUploadPdfFile(e.target.files?.[0] || null)} className="mt-2" />
              <button onClick={createResumeFromUpload} className="bg-purple-600 text-white px-4 py-2 rounded mt-4 hover:bg-purple-700">📤 Importer PDF</button>
            </>
          )}

          {generatedPdf && (
            <div className="mt-4">
              <a href={generatedPdf} target="_blank" rel="noreferrer" className="text-blue-600 underline mr-4">📄 Ouvrir le PDF</a>
              <a href={generatedPdf} download className="text-green-600 underline">📥 Télécharger</a>
            </div>
          )}
        </div>
      )}

{/* ----------- Gestion des Exercices et Astuces ----------- */}

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

  <button
    onClick={() => navigate("/admin/exercices")}
    className="bg-indigo-600 text-white p-6 rounded-xl shadow hover:bg-indigo-700"
  >
    📘 Gestion des Exercices du Soutien
  </button>

  <button
    onClick={() => navigate("/admin/astuces")}
    className="bg-green-600 text-white p-6 rounded-xl shadow hover:bg-green-700"
  >
    💡 Gestion des Astuces du Soutien
  </button>

</div>

    </div>
  );
};

export default AdminDashboard;