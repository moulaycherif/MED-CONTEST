import React, { createContext, useContext, useState, ReactNode } from "react";

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
      // ⚠️ Ajustez l'URL si nécessaire (ex: "http://localhost:5000/api/auth/guest" selon votre configuration)
      const response = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la génération du token invité");
      }

      const data = await response.json();
      
      // On utilise la fonction login pour enregistrer le vrai token et activer le mode invité
      login(data.token, true);

    } catch (error) {
      console.error("❌ Impossible de se connecter en tant qu'invité :", error);
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