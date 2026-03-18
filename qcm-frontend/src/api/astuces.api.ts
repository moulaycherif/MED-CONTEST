import api from "./axios";

export interface Astuce {
  question: string;
  answer: string;
}

export async function fetchAstucesByChapter(chapter: string) {
  console.log("📤 Chapitre envoyé :", chapter);

  const res = await api.get(`/api/astuces/${encodeURIComponent(chapter)}`);

  console.log("📥 Réponse API complète :", res);
  console.log("📦 Données reçues :", res.data);

  return res.data;
}
