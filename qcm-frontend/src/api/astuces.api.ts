import api from "./axios";

export interface Astuce {
  question: string;
  answer: string;
}

export async function fetchAstucesByChapter(chapter: string) {
  try {
    
    const res = await api.get(
      `/api/astuces/${encodeURIComponent(chapter)}`
    );

    return res.data;
  } catch (error: any) {
    console.error("❌ ERREUR API ASTUCES :", error.response || error);
    return [];
  }
}
