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
  selectedSubject: string | null;   // 🔥 Aligné avec StudentPage
  selectedChapter: string | null;  // 🔥 Aligné avec StudentPage
}

const StudentSummaries: React.FC<Props> = ({ selectedSubject, selectedChapter }) => {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!selectedSubject || !selectedChapter) return;

      setLoading(true);

      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/resume/by-subject-and-chapter`,
          {
            params: {
              subject: selectedSubject,
              chapter: selectedChapter
            }
          }
        );

        setResumes(res.data);
      } catch (err) {
        console.error("Erreur fetch résumés étudiant :", err);
        setResumes([]);
      }

      setLoading(false);
    };

    load();
  }, [selectedSubject, selectedChapter]);

  if (loading)
    return <p className="text-center my-4">Chargement…</p>;

  if (resumes.length === 0)
    return (
      <p className="text-center text-gray-500 my-6">
        Aucun résumé disponible pour ce chapitre.
      </p>
    );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        📘 Résumés — {selectedSubject} / {selectedChapter}
      </h2>

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
                  📄 Voir / Télécharger
                </a>
              </td>
              <td className="border px-2 py-1">
                {new Date(r.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentSummaries;
