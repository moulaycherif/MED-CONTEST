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
    if (error.response) {
      const status = error.response.status;
      const errorCode = error.response.data?.code;

      // 🚨 CAS 1 : Session écrasée par un autre appareil (403)
      // 🚨 CAS 2 : Jeton techniquement expiré ou corrompu (401)
      if (status === 403 || status === 401 || errorCode === "SESSION_KICKED") {
        
        // 1. Nettoyage complet des jetons
        localStorage.removeItem("token");
        localStorage.removeItem("adminToken");

        // 2. Message adapté à la situation
        if (status === 403 || errorCode === "SESSION_KICKED") {
          alert("⚠️ Déconnexion : Votre compte est actif sur un autre appareil.");
        } else {
          alert("🔑 Votre session a expiré. Veuillez vous reconnecter.");
        }

        // 3. Redirection immédiate
        window.location.href = "/login";
        
        return new Promise(() => {}); // Stop le flux de l'erreur
      }
    }

    return Promise.reject(error);
  }
);

export default api;