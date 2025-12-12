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
  selectedSubject: string;  // Matière
  selectedChapter: string;  // Titre du chapitre
}

const StudentSummaries: React.FC<Props> = ({ selectedSubject, selectedChapter }) => {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [filtered, setFiltered] = useState<ResumeItem[]>([]);
  const [filterOption, setFilterOption] = useState("ALL");

  const fetchBySubjectAndChapter = async () => {
    if (!selectedSubject || !selectedChapter) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/resume/by-subject/${selectedSubject}`
      );

      // 🎯 Filtrer uniquement les résumés du CHAPITRE sélectionné
      const list = res.data.filter(
        (r: ResumeItem) =>
          r.chapter.trim().toLowerCase() === selectedChapter.trim().toLowerCase()
      );

      setResumes(list);
      setFiltered(list);
    } catch (err) {
      console.error("Erreur fetch résumés étudiant :", err);
    }
  };

  useEffect(() => {
    fetchBySubjectAndChapter();
  }, [selectedSubject, selectedChapter]);

  useEffect(() => {
    if (filterOption === "ALL") {
      setFiltered(resumes);
    } else {
      setFiltered(resumes.filter((r) => r.chapter.includes(filterOption)));
    }
  }, [filterOption, resumes]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">📘 Résumés — {selectedSubject}</h2>

      <p className="text-gray-600 mb-2">Chapitre : {selectedChapter}</p>

      {/* Filtres A/B/C */}
      <div className="flex gap-3 mb-4">
        <button onClick={() => setFilterOption("ALL")}>Tous</button>
        <button onClick={() => setFilterOption("A")}>A</button>
        <button onClick={() => setFilterOption("B")}>B</button>
        <button onClick={() => setFilterOption("C")}>C</button>
      </div>

      <table className="w-full border border-gray-300">
        <thead>
          <tr>
            <th>Chapitre</th>
            <th>PDF</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r._id}>
              <td>{r.chapter}</td>
              <td>
                <a href={r.pdfUrl} target="_blank" className="text-blue-600 underline">
                  📄 Voir
                </a>
              </td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center py-3">Aucun résumé disponible.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentSummaries;
