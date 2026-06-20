import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";

interface AuthContextType {
  token: string | null;
  isGuest: boolean;
  login: (token: string, isGuestUser?: boolean) => void;
  loginGuest: () => Promise<void>; // 🟢 Renommé pour correspondre au Backend
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  
  // 🟢 NOUVEAU : On gère l'état invité via le localStorage pour survivre aux rafraîchissements
  const [isGuest, setIsGuest] = useState<boolean>(localStorage.getItem("isGuest") === "true");

  const login = (newToken: string, isGuestUser: boolean = false) => {
    setToken(newToken);
    setIsGuest(isGuestUser);
    
    localStorage.setItem("token", newToken);
    
    if (isGuestUser) {
      localStorage.setItem("isGuest", "true");
    } else {
      localStorage.removeItem("isGuest");
    }
  };

  // 🟢 NOUVEAU : Appel réel au Backend pour obtenir un VRAI jeton crypté
  const loginGuest = async () => {
  try {
    // 💡 On utilise axios. Ajustez le chemin "/api/auth/guest" si votre backend a un autre préfixe.
    const response = await axios.post("/api/auth/guest");

    // Avec Axios, la réponse est directement dans response.data
    login(response.data.token, true);

  } catch (error: any) {
    // 🚨 Cette ligne va afficher la VRAIE raison du blocage dans votre console !
    console.error(
      "❌ Raison exacte du refus :", 
      error.response?.data || error.message
    );
    throw error;
  }
};

  const logout = () => {
    setToken(null);
    setIsGuest(false);
    
    // 🚨 Nettoyage complet
    localStorage.removeItem("token");
    localStorage.removeItem("isGuest");
    localStorage.removeItem("adminToken");
  };

  return (
    <AuthContext.Provider value={{ token, isGuest, login, loginGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider");
  }
  return context;
};