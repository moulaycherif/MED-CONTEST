// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import ImportExcel from "./ImportExcel"; // si tu as créé un composant séparé

interface ImportResult {
  question: string;
  status: "✅" | "❌";
  details?: string[];
}

const AdminDashboard: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"append" | "replace" | "replace-global">("append");
  const [message, setMessage] = useState<string>("");
  const [details, setDetails] = useState<ImportResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [exams, setExams] = useState<string[]>([]); // pour afficher les examens
  const [selectedExam, setSelectedExam] = useState<string>("");

  // ---------- Chargement des examens ----------
  const fetchExams = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/questions/exams");
      setExams(res.data);
    } catch (err) {
      console.error("Erreur récupération examens :", err);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // ---------- Upload et import ----------
  const handleUpload = async () => {
    if (!file) {
      setMessage("⚠️ Veuillez choisir un fichier Excel");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `http://localhost:5000/api/questions/import?mode=${mode}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessage(res.data.message || "✅ Import réussi");
      if (res.data.details) setDetails(res.data.details);
      else setDetails([]);
      setCurrentPage(1);

      // 🔄 Refresh automatique de la liste des examens
      fetchExams();
    } catch (error: any) {
      console.error("❌ Erreur import :", error.response?.data || error.message);
      setMessage("❌ Erreur lors de l'import");
      setDetails([]);
    }
  };

  // ---------- Pagination ----------
  const totalPages = Math.ceil(details.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = details.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📂 Importer des questions</h1>

      {/* Sélection fichier */}
      <input type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files?.[0] || null)} className="mb-4" />

      {/* Modes import */}
      <div className="mb-4">
        <label className="mr-4">
          <input type="radio" value="append" checked={mode === "append"} onChange={() => setMode("append")} /> Ajouter (append)
        </label>
        <label className="mr-4">
          <input type="radio" value="replace" checked={mode === "replace"} onChange={() => setMode("replace")} /> Remplacer (replace)
        </label>
        <label>
          <input type="radio" value="replace-global" checked={mode === "replace-global"} onChange={() => setMode("replace-global")} /> Remplacer global
        </label>
      </div>

      <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4">
        Importer
      </button>

      {message && <p className="mt-4 font-semibold">{message}</p>}

      {/* Liste des examens */}
      <div className="mt-4">
        <label className="font-semibold mr-2">Examens disponibles :</label>
        <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} className="border px-2 py-1">
          <option value="">-- Choisir un examen --</option>
          {exams.map(exam => (
            <option key={exam} value={exam}>{exam}</option>
          ))}
        </select>
      </div>

      {/* Détails import */}
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
                  <td className="border px-2 py-1">{d.details ? d.details.join(", ") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">
              ⬅️ Précédent
            </button>
            <span>Page {currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">
              Suivant ➡️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
