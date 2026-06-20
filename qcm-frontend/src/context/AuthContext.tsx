import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  isGuest: boolean; // 🟢 NOUVEAU : Permet de savoir si on est en mode Démo
  login: (token: string) => void;
  loginAsGuest: () => void; // 🟢 NOUVEAU : Fonction pour se connecter en invité
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  // 🟢 NOUVEAU : Détermine si l'utilisateur actuel est l'invité
  const isGuest = token === "guest_token";

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  // 🟢 NOUVEAU : Connecte l'utilisateur en tant qu'invité
  const loginAsGuest = () => {
    setToken("guest_token");
    localStorage.setItem("token", "guest_token");
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, isGuest, login, loginAsGuest, logout }}>
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