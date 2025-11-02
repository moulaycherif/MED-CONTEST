import { Question } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

console.log("🌍 API_BASE_URL =", API_BASE_URL);

export async function fetchQuestionsBySubject(subject: string): Promise<Question[]> {
  const res = await fetch(`${API_BASE_URL}/api/questions?subject=${subject}`)
  if (!res.ok) throw new Error('Erreur de récupération des questions')
  return res.json()
}


