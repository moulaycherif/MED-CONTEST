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

interface StudentResumeListProps {
  selectedSubject: string;
  selectedChapitre: string;
}

const StudentResumeList: React.FC<StudentResumeListProps> = ({
  selectedSubject,
  selectedChapitre,
}) => {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFilteredResumes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/resume/all`);

      // 🔍 Filtrer par matière et chapitre
      const filtered = res.data.filter(
        (item: ResumeItem) =>
          item.subject === selectedSubject && item.chapter === selectedChapitre
      );

      setResumes(filtered);
    } catch (error) {
      console.error("Erreur lors du chargement des résumés :", error);
      setResumes([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchFilteredResumes();
  }, [selectedSubject, selectedChapitre]);

  if (loading) {
    return (
      <p className="text-center text-gray-700 mt-4">
        ⏳ Chargement des résumés…
      </p>
    );
  }

  if (resumes.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-6 text-lg">
        Aucun résumé disponible pour ce chapitre.
      </p>
    );
  }

  return (
    <div className="p-4">
      <table className="w-full border border-gray-300 rounded-lg shadow-lg">
        <thead className="bg-blue-100">
          <tr>
            <th className="border px-3 py-2 text-left">📘 Chapitre</th>
            <th className="border px-3 py-2 text-left">📄 Résumé</th>
            <th className="border px-3 py-2 text-left">📅 Date</th>
          </tr>
        </thead>
        <tbody>
          {resumes.map((r) => (
            <tr key={r._id} className="bg-white hover:bg-gray-100 transition">
              <td className="border px-3 py-2">{r.chapter}</td>

              <td className="border px-3 py-2">
                <a
                  href={r.pdfUrl + "?v=" + Date.now()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-semibold underline"
                >
                  📄 Ouvrir le PDF
                </a>
              </td>

              <td className="border px-3 py-2">
                {new Date(r.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentResumeList;
