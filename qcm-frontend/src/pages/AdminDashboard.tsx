// src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import SummaryList from "./SummaryList";

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

const AdminDashboard: React.FC = () => {
  const token = localStorage.getItem("token");

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
  const [students, setStudents] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Import
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"append" | "replace" | "replace-global">(
    "append"
  );
  const [importMessage, setImportMessage] = useState("");
  const [details, setDetails] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [exams, setExams] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState("");

  const itemsPerPage = 10;

  // Chargement étudiants
  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Erreur récupération étudiants.");
    }
  };

  // Création étudiant
  const handleCreateStudent = async () => {
    if (!name || !email || !password) {
      setMessage("Veuillez remplir tous les champs");
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
      setMessage(err.response?.data?.error || "Erreur création étudiant");
    }
  };

  // Supprimer étudiant
  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Supprimer cet étudiant ?")) return;
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/admin/students/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(res.data.message);
      fetchStudents();
    } catch (err) {
      setMessage("Erreur suppression étudiant");
    }
  };

  // Chargement examens
  const fetchExams = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/questions/exams`);
      setExams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Import Excel
  const handleUpload = async () => {
    if (!file) {
      setImportMessage("Veuillez choisir un fichier Excel");
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

      setImportMessage(res.data.message || "Import réussi");
      setDetails(res.data.details || []);
      setCurrentPage(1);
      fetchExams();
    } catch (error: any) {
      setImportMessage("Erreur lors de l'import");
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

    const formData = new FormData();
    formData.append("pdf", uploadPdfFile);
    formData.append("subject", subject);
    formData.append("chapter", chapter);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/resume/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const finalUrl = res.data?.pdfUrl || res.data?.url;
      if (!finalUrl) return alert("Erreur : URL manquante.");

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
        <h1 className="text-3xl font-bold flex-1 text-center">👩‍🏫 Tableau de bord Enseignant</h1>
        <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">🚪 Déconnexion</button>
      </div>

      {/* onglets (simplifié pour la démonstration) */}
      <div className="flex justify-center gap-4 mb-8">
        <button onClick={() => setActiveTab("students")} className={`px-4 py-2 rounded ${activeTab === "students" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>🧑‍🎓 Étudiants</button>
        <button onClick={() => setActiveTab("import")} className={`px-4 py-2 rounded ${activeTab === "import" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>📂 Import Questions</button>
        <button onClick={() => setActiveTab("summary")} className={`px-4 py-2 rounded ${activeTab === "summary" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>📝 Résumés</button>
      </div>

      {/* Summary tab */}
      {activeTab === "summary" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">📝 Gestion des résumés</h2>

          <SummaryList />

          <hr className="my-6" />

          <h3 className="text-xl font-bold mb-4">➕ Créer un résumé</h3>

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
            <label className="font-semibold">Chapitre :</label>
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
    </div>
  );
};

export default AdminDashboard;