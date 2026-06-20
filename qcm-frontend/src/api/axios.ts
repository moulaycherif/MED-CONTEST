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

// 🔒 2. Intercepteur de Réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const errorCode = error.response.data?.code;

      // ⚠️ Ignorer l'erreur si elle provient directement des tentatives de login 
      // pour éviter de vider le stockage sur une simple faute de frappe de mot de passe
      const isLoginRequest = error.config.url?.includes("/api/auth/login") || error.config.url?.includes("/api/auth/admin/login");

      if (!isLoginRequest && (status === 403 || status === 401 || errorCode === "SESSION_KICKED")) {
        
        // 🟢 NOUVEAU : On vérifie si c'est l'invité AVANT de vider le localStorage
        const isGuest = localStorage.getItem("token") === "guest_token";

        // 1. Nettoyage complet
        localStorage.removeItem("token");
        localStorage.removeItem("adminToken");

        // 🟢 NOUVEAU : Comportement séparé pour la Démo vs Utilisateurs réels
        if (isGuest) {
          alert("👋 Fin de la visite guidée ! Merci d'avoir testé Med-Contest.");
          window.location.href = "/"; // On redirige vers l'accueil plutôt que le login
          return new Promise(() => {});
        }

        // 2. Message adapté pour les VRAIS étudiants/admins
        if (status === 403 || errorCode === "SESSION_KICKED") {
          alert("⚠️ Déconnexion : Accès refusé ou compte actif sur un autre appareil.");
        } else {
          alert("🔑 Votre session a expiré. Veuillez vous reconnecter.");
        }

        // 3. Redirection classique
        window.location.href = "/login";
        
        return new Promise(() => {}); 
      }
    }

    return Promise.reject(error);
  }
);

export default api;