import api from "./axios";

export interface Astuce {
  question: string;
  answer: string;
}

export async function fetchAstucesByChapter(chapter: string): Promise<Astuce[]> {
  const res = await api.get(`/api/astuces/${encodeURIComponent(chapter)}`);
  return res.data;
}
