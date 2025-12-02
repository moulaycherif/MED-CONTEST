import { Question } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

console.log("🌍 API_BASE_URL =", API_BASE_URL);

// ================================
// 🔹 QCM par matière
// ================================
export async function fetchQuestionsBySubject(subject: string): Promise<Question[]> {
  const res = await fetch(`${API_BASE_URL}/api/questions?subject=${subject}`)
  if (!res.ok) throw new Error('Erreur de récupération des questions')
  return res.json()
}

// ================================
// 🔹 ASTUCES par chapitre
// ================================
export interface Astuce {
  question: string
  answer: string
}

export async function fetchAstucesByChapter(chapter: string): Promise<Astuce[]> {
  const url = `${API_BASE_URL}/api/astuces/${encodeURIComponent(chapter)}`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Erreur de récupération des astuces pour le chapitre : ${chapter}`)
  }

  return res.json()
}

export { API_BASE_URL }
