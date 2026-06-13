import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 🔹 1. Intercepteur de Requête (Ajout du token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      } as any; // Casté en as any si TypeScript rouspète sur la structure stricte des headers
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔒 2. NOUVEAU : Intercepteur de Réponse (Sécurité Poste Unique)
api.interceptors.response.use(
  (response) => {
    // Si la requête réussit, on laisse passer la réponse normalement
    return response;
  },
  (error) => {
    // On vérifie si l'erreur provient d'une réponse du backend (403 Forbidden)
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data?.code === "SESSION_KICKED"
    ) {
      // 1. Supprimer le token JWT local pour bloquer les futures requêtes de ce navigateur
      localStorage.removeItem("token");

      // 2. Alerter l'étudiant
      alert("⚠️ Déconnexion : Votre compte est connecté sur un autre poste informatique ou un autre navigateur.");

      // 3. Rediriger instantanément vers la page de connexion
      window.location.href = "/login";
      
      // On arrête le flux ici pour éviter que le composant reçoive une erreur brute
      return new Promise(() => {});
    }

    // Pour toutes les autres erreurs (404, 500, etc.), on les renvoie normalement aux composants
    return Promise.reject(error);
  }
);

export default api;