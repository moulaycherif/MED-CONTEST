import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import SummaryList from "./SummaryList";



// ✅ Fonction universelle de déconnexion
function logout() {
  try {
    // 🔹 Supprime tous les tokens potentiels
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("studentToken");

    // 🔹 (Optionnel) vider tout le localStorage
    // localStorage.clear();

    // 🔹 Supprimer les cookies auth éventuels
    document.cookie.split(";").forEach(function (c) {
      document.cookie =
        c.trim().split("=")[0] +
        "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });

    // 🔹 Redirection vers la page d’accueil
    window.location.href = "/";
  } catch (err) {
    console.error("Erreur pendant la déconnexion :", err);
  }
}

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface ImportResult {
  question: string;
  status: "✅" | "❌";
  details?: string[];
}

const AdminDashboard: React.FC = () => {

  // Résumé
const [subject, setSubject] = useState("");
const [chapter, setChapter] = useState("");
const [resumeContent, setResumeContent] = useState("");
const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);
 
  const [activeTab, setActiveTab] = useState<"students" | "import" | "summary">("students");
 
  // ---------- Gestion Étudiants ----------
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // ---------- Import Questions ----------
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"append" | "replace" | "replace-global">("append");
  const [importMessage, setImportMessage] = useState<string>("");
  const [details, setDetails] = useState<ImportResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [exams, setExams] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("");

  const token = localStorage.getItem("token");
  const itemsPerPage = 10;

  // ===============================================
  // 📘 SECTION : ÉTUDIANTS
  // ===============================================

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

  const handleCreateStudent = async () => {
    if (!name || !email || !password) {
      setMessage("⚠️ Veuillez remplir tous les champs");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/create-student`,
        { name, email, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setName("");
      setEmail("");
      setPassword("");
      fetchStudents();
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.error || "Erreur création étudiant");
    }
  };

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

  const fetchExams = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/questions/exams`);
      setExams(res.data);
    } catch (err) {
      console.error("Erreur récupération examens :", err);
    }
  };

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

 const handleGeneratePdf = async () => {
  if (!subject || !chapter || !resumeContent) {
    alert("Veuillez remplir toutes les informations.");
    return;
  }

  try {
    // 🔥 Appel backend pour générer le PDF
    const res = await axios.post(
      `${API_BASE_URL}/api/resume/generate`,
      { subject, chapter, content: resumeContent },
      { responseType: "blob" }   // OBLIGATOIRE pour recevoir un PDF
    );

    // 🔥 Créer un lien Blob pour afficher/télécharger le PDF
    const pdfBlob = new Blob([res.data], { type: "application/pdf" });
    const pdfUrl = window.URL.createObjectURL(pdfBlob);

    setGeneratedPdf(pdfUrl);

    alert("PDF généré avec succès !");
  } catch (err) {
    console.error("Erreur PDF:", err);
    alert("Erreur lors de la génération du PDF.");
  }
};

  // ===============================================
  // 🧩 Rendu principal
  // ===============================================

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ✅ Header avec bouton de déconnexion */}
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

      {/* Onglets */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 rounded ${
            activeTab === "students" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          🧑‍🎓 Gestion des étudiants
        </button>
        <button
          onClick={() => setActiveTab("import")}
          className={`px-4 py-2 rounded ${
            activeTab === "import" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          📂 Import des questions
        </button>

        <button
  onClick={() => setActiveTab("summary")}
  className={`px-4 py-2 rounded ${
    activeTab === "summary" ? "bg-blue-600 text-white" : "bg-gray-200"
  }`}
>
  📝 Résumés
</button>

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
                <option key={exam} value={exam}>
                  {exam}
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
    <h2 className="text-2xl font-bold mb-4">📝 Résumés</h2>

    {/* 1. Liste des résumés */}
    <SummaryList />

    <hr className="my-6" />

    {/* 2. Création d’un nouveau résumé */}
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4">➕ Créer un nouveau résumé</h3>

      <div className="mb-4">
        <label className="font-semibold">Matière :</label>
        <input
          type="text"
          className="border px-2 py-1 ml-2"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold">Chapitre :</label>
        <input
          type="text"
          className="border px-2 py-1 ml-2"
          value={chapter}
          onChange={e => setChapter(e.target.value)}
        />
      </div>

      <textarea
        placeholder="Contenu du résumé..."
        className="border w-full h-60 p-3"
        value={resumeContent}
        onChange={e => setResumeContent(e.target.value)}
      ></textarea>

      <button
        onClick={async () => {
          if (!subject || !chapter || !resumeContent) {
            alert("Veuillez remplir toutes les informations.");
            return;
          }

          try {
            const res = await axios.post(
              `${API_BASE_URL}/api/resume/generate`,
              { subject, chapter, content: resumeContent }
            );

            const finalUrl = res.data?.url;

            if (!finalUrl) {
              alert("Erreur : URL non reçue.");
              return;
            }

            setGeneratedPdf(finalUrl);
            alert("PDF généré avec succès !");
          } catch (err) {
            console.error("Erreur PDF:", err);
            alert("Erreur lors de la génération du PDF.");
          }
        }}
        className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700"
      >
        📄 Générer PDF
      </button>

      {generatedPdf && (
        <div className="mt-4">
          {/* Ouvrir */}
          <a
            href={generatedPdf}
            target="_blank"
            className="text-blue-600 underline mr-4"
          >
            📄 Ouvrir le PDF
          </a>

          {/* Télécharger */}
          <a
            href={generatedPdf}
            download
            className="text-green-600 underline"
          >
            📥 Télécharger
          </a>
        </div>
      )}
    </div>
  </div>
)}

    </div>
  );
};

export default AdminDashboard;
