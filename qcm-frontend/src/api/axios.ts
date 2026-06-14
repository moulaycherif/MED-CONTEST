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
  (response) => response,
  (error) => {
    // 🚨 MODIFICATION ICI : On éjecte dès qu'il y a un 403 (ou si le code match)
    if (
      error.response && 
      (error.response.status === 403 || error.response.data?.code === "SESSION_KICKED")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("adminToken");

      alert("⚠️ Déconnexion : Votre compte est actif sur un autre appareil.");
      window.location.href = "/login";
      
      return new Promise(() => {});
    }
    return Promise.reject(error);
  }
);

export default api;