import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";

interface ResumeItem {
  _id: string;
  subject: string;
  chapter: string;
  pdfUrl: string;
}

const StudentResumeList: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  const fetchResumes = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/resume/all`);
    setResumes(res.data);

    const uniqueSubjects = [...new Set(res.data.map((r: ResumeItem) => r.subject))];
    setSubjects(uniqueSubjects);
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const filtered = selectedSubject
    ? resumes.filter((r) => r.subject === selectedSubject)
    : resumes;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📘 Résumés de Soutien</h2>

      {/* Choix matière */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Matière :</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border px-2 py-1"
        >
          <option value="">Toutes</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Liste */}
      <ul className="space-y-2">
        {filtered.map((r) => (
          <li key={r._id} className="border p-3 rounded">
            <div className="font-semibold">{r.subject}</div>
            <div className="text-gray-700">Chapitre : {r.chapter}</div>

            <a
              href={r.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline mt-1 inline-block"
            >
              📄 Consulter le résumé
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentResumeList;
