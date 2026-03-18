import api from "./axios";

export interface Astuce {
  question: string;
  answer: string;
}

export async function fetchAstucesByChapter(chapter: string): Promise<Astuce[]> {
  console.log("API astuces brut :");
  const res = await api.get(`/api/astuces/${encodeURIComponent(chapter)}`);
  console.log("API astuces brut :", res.data);
  return res.data;
  console.log("API astuces brut :", res.data);
}
