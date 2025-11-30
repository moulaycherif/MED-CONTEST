import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

interface ResumeItem {
  _id: string;
  subject: string;
  chapter: string;
  pdfUrl: string;
  createdAt: string;
}

interface Props {
  subject: string; // 👉 Matière déjà sélectionnée dans StudentPage
}

const StudentSummaries: React.FC<Props> = ({ subject }) => {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [filtered, setFiltered] = useState<ResumeItem[]>([]);
  const [filterOption, setFilterOption] = useState("ALL");

  const fetchBySubject = async () => {
    if (!subject) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/resume/by-subject/${subject}`);
      setResumes(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Erreur fetch résumés étudiant :", err);
    }
  };

  useEffect(() => {
    fetchBySubject();
  }, [subject]);

  // 🔍 Filtrage A / B / C / ALL
  useEffect(() => {
    if (filterOption === "ALL") {
      setFiltered(resumes);
    } else {
      setFiltered(resumes.filter((r) => r.chapter.includes(filterOption)));
    }
  }, [filterOption, resumes]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">📘 Résumés — {subject}</h2>

      {/* Filtres A B C */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setFilterOption("ALL")}
          className={`px-4 py-2 rounded-lg ${filterOption === "ALL" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Tous
        </button>

        <button
          onClick={() => setFilterOption("A")}
          className={`px-4 py-2 rounded-lg ${filterOption === "A" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          A
        </button>

        <button
          onClick={() => setFilterOption("B")}
          className={`px-4 py-2 rounded-lg ${filterOption === "B" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          B
        </button>

        <button
          onClick={() => setFilterOption("C")}
          className={`px-4 py-2 rounded-lg ${filterOption === "C" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          C
        </button>
      </div>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-2 py-1">Chapitre</th>
            <th className="border px-2 py-1">PDF</th>
            <th className="border px-2 py-1">Date</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((r) => (
            <tr key={r._id} className="text-sm">
              <td className="border px-2 py-1">{r.chapter}</td>
              <td className="border px-2 py-1">
                <a
                  href={r.pdfUrl}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  📄 Voir
                </a>
              </td>
              <td className="border px-2 py-1">
                {new Date(r.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td className="border px-2 py-3 text-center" colSpan={3}>
                Aucun résumé disponible.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentSummaries;
