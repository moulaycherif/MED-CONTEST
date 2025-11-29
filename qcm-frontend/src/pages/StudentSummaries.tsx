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

const StudentSummaries: React.FC = () => {
  const [subject, setSubject] = useState("");
  const [resumes, setResumes] = useState<ResumeItem[]>([]);

  const fetchBySubject = async (sub: string) => {
    if (!sub) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/resume/by-subject/${sub}`);
      setResumes(res.data);
    } catch (err) {
      console.error("Erreur fetch by subject :", err);
    }
  };

  useEffect(() => {
    if (subject) fetchBySubject(subject);
  }, [subject]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">📘 Résumés par matière</h2>

      <select
        className="border px-3 py-2 mb-4"
        onChange={(e) => setSubject(e.target.value)}
      >
        <option value="">-- Choisir une matière --</option>
        <option value="Mathématique">Mathématique</option>
        <option value="Physique">Physique</option>
        <option value="Chimie">Chimie</option>
        <option value="SVT">SVT</option>
        {/* ajoute toutes tes matières */}
      </select>

      {subject && (
        <h3 className="text-lg font-semibold mb-2">
          Résumés disponibles : {subject}
        </h3>
      )}

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-2 py-1">Chapitre</th>
            <th className="border px-2 py-1">PDF</th>
            <th className="border px-2 py-1">Date</th>
          </tr>
        </thead>

        <tbody>
          {resumes.map((r) => (
            <tr key={r._id} className="text-sm">
              <td className="border px-2 py-1">{r.chapter}</td>
              <td className="border px-2 py-1">
                <a
                  href={r.pdfUrl}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  📄 Ouvrir
                </a>
              </td>
              <td className="border px-2 py-1">
                {new Date(r.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}

          {resumes.length === 0 && subject && (
            <tr>
              <td className="border px-2 py-3 text-center" colSpan={3}>
                Aucun résumé disponible pour cette matière.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentSummaries;
