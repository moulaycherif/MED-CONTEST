// src/axios.ts (ou le chemin correct de votre fichier)
import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 🔹 1. Intercepteur de Requête Adaptatif (Admin ou Étudiant)
api.interceptors.request.use(
  (config) => {
    // 🔄 Récupère le token admin en priorité, sinon le token étudiant
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      } as any;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔒 2. Intercepteur de Réponse (axios.ts)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const errorCode = error.response.data?.code;

      // Vérifier si l'utilisateur actuel est un invité démo
      const isGuest = localStorage.getItem("token") === "guest_token";

      // 🛡️ SI ON EST EN MODE INVITÉ : On bloque TOUTES les expulsions automatiques !
      if (isGuest) {
        console.warn("⚠️ Mode Démo : Requête bloquée ou non autorisée mais ignorée pour la visite", error.config.url);
        return Promise.reject(error);
      }

      // --- COMPORTEMENT NORMAL POUR LES VRAIS ÉTUDIANTS COMPLETS ---
      const isLoginRequest = error.config.url?.includes("/api/auth/login") || error.config.url?.includes("/api/auth/admin/login");

      if (!isLoginRequest && (status === 403 || status === 401 || errorCode === "SESSION_KICKED")) {
        localStorage.removeItem("token");
        localStorage.removeItem("adminToken");

        if (status === 403 || errorCode === "SESSION_KICKED") {
          alert("⚠️ Déconnexion : Accès refusé ou compte actif sur un autre appareil.");
        } else {
          alert("🔑 Votre session a expiré. Veuillez vous reconnecter.");
        }

        window.location.href = "/login";
        return new Promise(() => {}); // Bloque la propagation
      }
    }

    return Promise.reject(error);
  }
);

export default api;