import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

interface ResumeItem {
  id: string;
  subject: string;
  chapter: string;
  url: string;
  created_at: string | null;
}

export default function StudentSummaries({
  selectedSubject,
  selectedChapter,
}: {
  selectedSubject: string | null;
  selectedChapter: string | null;
}) {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [filtered, setFiltered] = useState<ResumeItem[]>([]);

  useEffect(() => {
    if (!selectedSubject) return;

    axios
      .get(`${API_BASE_URL}/api/resume/by-subject/${selectedSubject}`)
      .then((res) => {
        const all = res.data;
        setResumes(all);

        if (!selectedChapter) {
          setFiltered(all);
          return;
        }

        // 🎯 Filtrage EXACT (pas flou)
        const cleanedSelected = selectedChapter
          .toLowerCase()
          .trim()
          .replace(/\s+/g, " ");

        const filteredList = all.filter((r: ResumeItem) => {
          const cleanedChap = r.chapter
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ");
          return cleanedChap === cleanedSelected;
        });

        setFiltered(filteredList);
      })
      .catch((err) => console.error("Erreur fetch résumés étudiant :", err));
  }, [selectedSubject, selectedChapter]);

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">📘 Résumés — {selectedSubject}</h3>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center">Aucun résumé disponible.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="p-4 bg-white rounded-xl shadow">
              <h4 className="font-semibold">{item.chapter}</h4>

              <p className="text-sm text-gray-500">
                {item.created_at ? item.created_at.slice(0, 10) : "Date inconnue"}
              </p>

              {item.url ? (
              <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-center"
              >
              📄 Voir le PDF
              </a>
              ) : (
              <p className="text-red-500 text-sm mt-2">PDF indisponible</p>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
