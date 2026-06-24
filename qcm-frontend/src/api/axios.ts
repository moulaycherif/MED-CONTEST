// src/axios.ts
import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 🔹 1. Intercepteur de Requête Adaptatif (Admin ou Étudiant)
// 🔒 2. Intercepteur de Réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const errorCode = error.response.data?.code;

      const isGuest = localStorage.getItem("isGuest") === "true";
      const url = error.config.url || "";
      
      // 🟢 CORRECTION : On définit isLoginRequest AVANT de vérifier le mode invité
      const isLoginRequest = url.includes("/api/auth/login") || url.includes("/api/auth/admin/login");

      // 🛡️ SI ON EST EN MODE INVITÉ ET QUE CE N'EST PAS UNE TENTATIVE DE CONNEXION
      if (isGuest && !isLoginRequest) {
        console.warn("⚠️ Mode Démo : Requête restreinte ou en attente, ignorée pour la visite", url);
        
        if (
          url.includes("/api/student-activity") || 
          url.includes("/api/stats") || 
          url.includes("/api/auth/logout")
        ) {
          return Promise.resolve({
            status: 200,
            statusText: "OK",
            data: url.includes("/api/student-activity") ? { message: "Activité simulée Démo" } : {},
            headers: error.response.headers,
            config: error.config,
          });
        }

        return Promise.reject(error);
      }

      // --- COMPORTEMENT NORMAL POUR LES VRAIS ÉTUDIANTS / ADMINS ---
      if (!isLoginRequest && (status === 403 || status === 401 || errorCode === "SESSION_KICKED")) {
        localStorage.removeItem("token");
        localStorage.removeItem("adminToken");
        // On nettoie aussi le mode invité par sécurité lors d'une expulsion
        localStorage.removeItem("isGuest"); 

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

// 🔒 2. Intercepteur de Réponse
// 🔒 2. Intercepteur de Réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const errorCode = error.response.data?.code;

      // Vérifie le drapeau "isGuest" dans le localStorage
      const isGuest = localStorage.getItem("isGuest") === "true";

      // 🛡️ SI ON EST EN MODE INVITÉ
      if (isGuest) {
        console.warn("⚠️ Mode Démo : Requête restreinte ou en attente, ignorée pour la visite", error.config.url);
        
        const url = error.config.url || "";
        
        // 🔥 CORRECTION CRUCIALE : Si l'activité, les stats ou le logout échouent,
        // on transforme le rejet en SUCCÈS simulé pour éviter que React ne perde les pédales et ne charge SVT.
        if (
          url.includes("/api/student-activity") || 
          url.includes("/api/stats") || 
          url.includes("/api/auth/logout")
        ) {
          return Promise.resolve({
            status: 200,
            statusText: "OK",
            data: url.includes("/api/student-activity") ? { message: "Activité simulée Démo" } : {},
            headers: error.response.headers,
            config: error.config,
          });
        }

        // Pour les autres vraies erreurs critiques (ex: chargement d'une image ou page inexistante)
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