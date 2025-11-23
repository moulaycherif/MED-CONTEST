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
    const res = await axios.get(`${API_BASE_URL}/api/resume/list`);
    setResumes(res.data);
  };

  useEffect(() => {
    fetchResumes();
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
          {resumes.map(r => (
            <tr key={r._id} className="text-sm">
              <td className="border px-2 py-1">{r.subject}</td>
              <td className="border px-2 py-1">{r.chapter}</td>
              <td className="border px-2 py-1">
                <a href={`${API_BASE_URL}${r.pdfUrl}`} target="_blank" className="text-blue-600 underline">📄 Ouvrir</a>
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
