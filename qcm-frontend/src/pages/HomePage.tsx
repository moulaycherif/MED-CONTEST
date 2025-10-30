// src/pages/HomePage.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import StudentDashboardFull from "./StudentDashboardFull";
import AdminDashboard from "./AdminDashboard";
import BackgroundWrapper from "../components/BackgroundWrapper";

import imageEt from "../Image2.jfif";
import imageEn from "../Image3.jfif";

export default function HomePage() {
  const [mode, setMode] = useState<"login" | "student" | "admin" | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      setToken(res.data.token); // JWT
      setMode("student"); // accès au dashboard
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur de connexion");
    }
  };

  return (
    <BackgroundWrapper>
      <main className="flex flex-col min-h-screen p-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl font-bold text-black drop-shadow-lg mb-10"
        >
          🎓 QCM - Médecine
        </motion.h1>

        {/* Choix Étudiant / Enseignant */}
        {mode === "" && (
          <motion.div
            className="flex flex-col md:flex-row items-center justify-center flex-grow gap-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={() => setMode("login")}
              className="relative flex flex-col items-center justify-center text-white font-bold py-12 px-16 rounded-2xl shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl"
              style={{
                backgroundImage: `url(${imageEt})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: "260px",
                height: "180px",
              }}
            >
              <span className="text-2xl backdrop-blur-sm bg-black/40 rounded-lg px-4 py-2">
                👨‍🎓 Étudiant
              </span>
            </button>

            <button
              onClick={() => setMode("admin")}
              className="relative flex flex-col items-center justify-center text-white font-bold py-12 px-16 rounded-2xl shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl"
              style={{
                backgroundImage: `url(${imageEn})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: "260px",
                height: "180px",
              }}
            >
              <span className="text-2xl backdrop-blur-sm bg-black/40 rounded-lg px-4 py-2">
                👩‍🏫 Enseignant
              </span>
            </button>
          </motion.div>
        )}

        {/* Formulaire de connexion étudiant */}
        {mode === "login" && !token && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border px-3 py-2 rounded w-64 text-black bg-white"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border px-3 py-2 rounded w-64 text-black bg-white"
            />
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Se connecter
            </button>
            {error && <p className="text-red-600">{error}</p>}
            <button onClick={() => setMode("")} className="mt-2 text-gray-600 underline">
              🔙 Retour
            </button>
          </motion.div>
        )}

        {/* Dashboard Étudiant */}
        {mode === "student" && token && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full mt-6 bg-white/90 text-gray-900 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-700">🧩 Tableau de bord Étudiant</h2>
              <button
                onClick={() => { setMode(""); setToken(null); }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                🔙 Déconnexion
              </button>
            </div>
            <StudentDashboardFull token={token} />
          </motion.div>
        )}

        {/* Dashboard Enseignant */}
        {mode === "admin" && !token && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center gap-4"
  >
    <input
      type="email"
      placeholder="Email admin"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="border px-3 py-2 rounded w-64 text-black bg-white"
    />
    <input
      type="password"
      placeholder="Mot de passe admin"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="border px-3 py-2 rounded w-64 text-black bg-white"
    />
    <button
      onClick={async () => {
        try {
          const res = await axios.post("http://localhost:5000/api/auth/login-admin", { email, password });
          setToken(res.data.token);
          localStorage.setItem("token", res.data.token);
          setError("");
        } catch (err: any) {
          setError(err.response?.data?.error || "Erreur de connexion admin");
        }
      }}
      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
    >
      Se connecter (Admin)
    </button>
    {error && <p className="text-red-600">{error}</p>}
    <button onClick={() => setMode("")} className="mt-2 text-gray-600 underline">
      🔙 Retour
    </button>
  </motion.div>
)}

{mode === "admin" && token && <AdminDashboard />}

      </main>
    </BackgroundWrapper>
  );
}
