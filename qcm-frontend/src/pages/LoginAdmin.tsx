import React, { useState } from "react";
import axios from "axios";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const API_BASE_URL = "https://med-contest-backend.onrender.com";


  // 🔧 Test temporaire : forcer l'URL de l'API backend
// const API_BASE_URL =
//  import.meta.env.VITE_API_BASE_URL || "https://med-contest-backend.onrender.com";

console.log("🌍 API_BASE_URL (forcée) =", API_BASE_URL);


  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login-admin`, {
      email,
      password,
    });
    setMessage("Connexion réussie ✅");
    localStorage.setItem("token", res.data.token);
  } catch (err: any) {
    setMessage(err.response?.data?.error || "Erreur de connexion ❌");
  }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Connexion Admin</h1>
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80">
        <label className="block mb-2">Email :</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />

        <label className="block mb-2">Mot de passe :</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Se connecter
        </button>

        {message && <p className="mt-3 text-sm text-center text-gray-600">{message}</p>}
      </form>
    </div>
  );
};

export default AdminLogin;
