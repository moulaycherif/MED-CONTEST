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
  selectedSubject: string;
  selectedChapterTitle: string; // 👉 Titre réel du chapitre
}

const StudentSummaries: React.FC<Props> = ({ selectedSubject, selectedChapterTitle }) => {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [filtered, setFiltered] = useState<ResumeItem[]>([]);
  const [filterOption, setFilterOption] = useState("ALL");

  const fetchBySubjectAndChapter = async () => {
    if (!selectedSubject || !selectedChapterTitle) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/resume/by-subject/${selectedSubject}`
      );

      // 🎯 Garder uniquement les PDF dont le CHAPTER correspond exactement
      const list = res.data.filter((r: ResumeItem) =>
        r.chapter.trim().toLowerCase() === selectedChapterTitle.trim().toLowerCase()
      );

      setResumes(list);
      setFiltered(list);
    } catch (err) {
      console.error("Erreur fetch résumés étudiant :", err);
    }
  };

  useEffect(() => {
    fetchBySubjectAndChapter();
  }, [selectedSubject, selectedChapterTitle]);


  // 🎯 Filtrage dynamique
  useEffect(() => {
    let f = resumes;

    if (filterLetter !== "ALL") {
      f = f.filter((r) => r.chapter.includes(filterLetter));
    }

    if (filterChapter !== "ALL") {
      f = f.filter((r) => r.chapter === filterChapter);
    }

    setFiltered(f);
  }, [filterLetter, filterChapter, resumes]);

  return (
    <div className="p-4">

      {/* TITRE */}
      <h2 className="text-2xl font-bold mb-4">
        📘 Résumés — {subject}
      </h2>

      {/* FILTRES */}
      <div className="flex flex-wrap gap-4 mb-6">

        {/* Filtre A / B / C */}
        <div className="flex gap-2">
          {["ALL", "A", "B", "C"].map((opt) => (
            <button
              key={opt}
              onClick={() => setFilterLetter(opt)}
              className={`px-4 py-2 rounded-lg ${
                filterLetter === opt
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {opt === "ALL" ? "Tous" : opt}
            </button>
          ))}
        </div>

        {/* Filtre Chapitres */}
        <select
          value={filterChapter}
          onChange={(e) => setFilterChapter(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="ALL">Tous les chapitres</option>
          {chapters.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

      </div>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {filtered.map((r) => (
          <div
            key={r._id}
            className="border rounded-xl p-4 shadow hover:shadow-lg transition bg-white"
          >
            {/* TITRE */}
            <h3 className="font-bold text-lg mb-2">{r.chapter}</h3>

            {/* DATE */}
            <p className="text-sm text-gray-500 mb-3">
              {new Date(r.createdAt).toLocaleDateString()}
            </p>

            {/* BUTTON */}
            <a
              href={r.pdfUrl}
              target="_blank"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              📄 Voir le PDF
            </a>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="col-span-full text-center text-gray-500 text-lg">
            Aucun résumé disponible.
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentSummaries;
