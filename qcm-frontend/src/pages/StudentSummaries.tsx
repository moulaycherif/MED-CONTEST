import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

console.log("🔍 StudentSummaries → selectedSubject:", selectedSubject);
console.log("🔍 StudentSummaries → selectedChapter:", selectedChapter);

interface ResumeItem {
  id: string;
  subject: string;
  chapter: string;
  url: string;
  created_at: string;
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

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/chapitre\s*[ivx]+\s*[:\-]*/g, "")
      .trim();

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

        const target = normalize(selectedChapter);

        const filteredList = all.filter((r: ResumeItem) => {
          const chap = normalize(r.chapter);

          // 🎯 Filtrage intelligent
          return chap.includes(target) || target.includes(chap);
        });

        setFiltered(filteredList);
      })
      .catch((err) => {
        console.error("Erreur fetch résumés étudiant :", err);
      });
  }, [selectedSubject, selectedChapter]);

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">
        📘 Résumés — {selectedSubject}
      </h3>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center">Aucun résumé disponible.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="p-4 bg-white rounded-xl shadow">
              <h4 className="font-semibold">{item.chapter}</h4>
              <p className="text-sm text-gray-500">{item.created_at.slice(0, 10)}</p>

              <a
                href={item.url}
                target="_blank"
                className="block mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-center"
              >
                📄 Voir le PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
