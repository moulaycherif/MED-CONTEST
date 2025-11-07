import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config";
import AdminDashboard from "./AdminDashboard";
import StudentPage from "./StudentPage";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<"admin" | "student" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Connexion admin
      const adminRes = await axios.post(`${API_BASE_URL}/api/auth/admin/login`, {
        email,
        password,
      });

      setToken(adminRes.data.token);
      localStorage.setItem("token", adminRes.data.token);
      setRole("admin");
      setLoading(false);
      return;
    } catch (err) {
      // Si ce n’est pas un admin, on essaie étudiant
    }

    try {
      // 2️⃣ Connexion étudiant
      const studentRes = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      setToken(studentRes.data.token);
      localStorage.setItem("token", studentRes.data.token);
      setRole("student");
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Email ou mot de passe incorrect ❌");
      setLoading(false);
    }
  };

  // 🔹 Redirection dynamique après login
  if (token && role === "admin") return <AdminDashboard />;
  if (token && role === "student") return <StudentPage token={token} />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-xl rounded-2xl p-8 w-[90%] max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          🔐 Connexion à Med-Contest
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        {error && <p className="text-red-600 text-center mt-3">{error}</p>}

        <p className="text-gray-500 text-center text-sm mt-6">
          © 2025 Med-Contest — Tous droits réservés
        </p>
      </motion.div>
    </div>
  );
}
