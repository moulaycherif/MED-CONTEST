import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  isGuest: boolean;
  login: (token: string) => void;
  loginAsGuest: () => Promise<void>; // 🟢 Modifié : Accepte désormais l'asynchrone
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const isGuest = token === "guest_token";

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  // 🟢 NOUVEAU : Fonction asynchrone avec délai de synchronisation
  const loginAsGuest = async () => {
    // 1. Force l'écriture dans le navigateur
    localStorage.setItem("token", "guest_token");
    
    // 2. Informe React
    setToken("guest_token");
    
    // 3. Laisse 100 millisecondes à React et au navigateur pour synchroniser leurs états
    return new Promise<void>((resolve) => setTimeout(resolve, 100));
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