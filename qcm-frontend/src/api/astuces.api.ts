import api from "./axios";

console.log("API astuces routine :");

export interface Astuce {
  question: string;
  answer: string;
}

export async function fetchAstucesByChapter(chapter: string): Promise<Astuce[]> {
  const res = await api.get(`/api/astuces/${encodeURIComponent(chapter)}`);
  console.log("API astuces brut :", res.data);
  return res.data;
}
