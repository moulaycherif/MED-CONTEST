import React, { useState } from "react";
import axios from "axios";

import { API_BASE_URL } from "../config";

export default function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      onLoginSuccess();
    } catch (err) {
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white shadow-md p-8 rounded-xl w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Connexion Étudiant</h2>
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="border p-2 w-full mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700">
          Se connecter
        </button>
      </form>
    </div>
  );
}
