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

const SummaryList: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);

  const fetchResumes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/resume/all`);
      setResumes(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des résumés :", err);
    }
  };

  useEffect(() => {
    // Initial load
    fetchResumes();

    // Auto-refresh on global event
    const onUpdated = () => fetchResumes();
    window.addEventListener("resumesUpdated", onUpdated);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resumesUpdated", onUpdated);
    };
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📚 Liste des Résumés Générés</h2>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-2 py-1">Matière</th>
            <th className="border px-2 py-1">Chapitre</th>
            <th className="border px-2 py-1">PDF</th>
            <th className="border px-2 py-1">Date</th>
          </tr>
        </thead>
        <tbody>
          {resumes.map((r) => (
            <tr key={r._id} className="text-sm">
              <td className="border px-2 py-1">{r.subject}</td>
              <td className="border px-2 py-1">{r.chapter}</td>
              <td className="border px-2 py-1">
                <a
                  href={r.pdfUrl + "?v=" + Date.now()}
                  target="_blank"
                  rel="noopener noreferrer"
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
        </tbody>
      </table>
    </div>
  );
};

export default SummaryList;
