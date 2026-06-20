import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config";
import AdminDashboard from "./AdminDashboard";
import StudentPage from "./StudentPage";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(localStorage.getItem("token") || localStorage.getItem("adminToken"));
  const [role, setRole] = useState<"admin" | "student" | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 🚨 ÉTAT NOUVEAU : Permet d'afficher le bouton "Forcer la connexion"
  const [showForceButton, setShowForceButton] = useState(false);

  // 🔄 Auto-détection du rôle si un token existe déjà au chargement de la page
  useEffect(() => {
    if (localStorage.getItem("adminToken")) {
      setRole("admin");
    } else if (localStorage.getItem("token")) {
      setRole("student");
    }
  }, []);

  // 🛠️ La fonction accepte désormais un paramètre "force" (par défaut à false)
  const handleLogin = async (e: React.FormEvent, force: boolean = false) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Si ce n'est pas une tentative forcée, on cache le bouton le temps de vérifier
    if (!force) setShowForceButton(false);

    try {
      // 1️⃣ Tentative de connexion admin
      const adminRes = await axios.post(`${API_BASE_URL}/api/auth/admin/login`, {
        email,
        password,
        force, // 👈 On transmet le paramètre au backend
      });

      localStorage.setItem("adminToken", adminRes.data.token);
      setToken(adminRes.data.token);
      setRole("admin");
      setLoading(false);

      // ⚡ Déclencheur magique pour actualiser instantanément la Navbar
      window.dispatchEvent(new Event("authChange"));
      return;
    } catch (err: any) {
      // 🚨 Si l'admin est déjà connecté (Erreur 409), on stoppe tout ici et on affiche le bouton !
      if (err.response?.status === 409) {
        setError(err.response?.data?.error || "Un administrateur est déjà connecté.");
        setShowForceButton(true);
        setLoading(false);
        return; 
      }
      // Si c'est une autre erreur (ex: 401 mot de passe faux), on passe à l'essai étudiant
    }

    try {
      // 2️⃣ Tentative de connexion étudiant
      const studentRes = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
        force, // 👈 On transmet le paramètre au backend
      });

      localStorage.setItem("token", studentRes.data.token);
      setToken(studentRes.data.token);
      setRole("student");
      setLoading(false);

      // ⚡ Déclencheur magique pour actualiser instantanément la Navbar
      window.dispatchEvent(new Event("authChange"));
    } catch (err: any) {
      // 🚨 Si l'étudiant est déjà connecté (Erreur 409)
      if (err.response?.status === 409) {
        setError(err.response?.data?.error || "Ce compte est déjà connecté ailleurs.");
        setShowForceButton(true);
      } else {
        // Erreur classique (Identifiants invalides, etc.)
        setError(err.response?.data?.error || "Email ou mot de passe incorrect ❌");
      }
      setLoading(false);
    }
  };

  // 🔹 Redirection ou affichage dynamique après login
  if (token && role === "admin") return <AdminDashboard />;
  if (token && role === "student") return <StudentPage token={token} />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-xl rounded-2xl p-8 w-[90%] max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          🔐 Connexion à Med-Contest
        </h1>

        <form onSubmit={(e) => handleLogin(e, false)} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setShowForceButton(false); // Cache le bouton si l'utilisateur change d'adresse
            }}
            className="border border-gray-300 text-gray-900 bg-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setShowForceButton(false); // Cache le bouton si l'utilisateur change de mot de passe
            }}
            className="border border-gray-300 text-gray-900 bg-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            required
          />

          {/* 🔘 Bouton de connexion standard */}
          {!showForceButton && (
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          )}
        </form>

        {/* 🚨 BLOC ERREUR CLASSIQUE */}
        {error && !showForceButton && (
          <p className="text-red-600 text-center mt-3 font-medium">{error}</p>
        )}

        {/* ⚡ INTERFACE D'URGENCE : Apparaît uniquement en cas de double session (Code 409) */}
        {showForceButton && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-xl text-center flex flex-col gap-3"
          >
            <p className="text-amber-800 text-sm font-medium">
              ⚠️ {error}
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={(e) => handleLogin(e, true)} // 👈 Relance handleLogin avec force = true
              className="bg-amber-600 text-white text-sm font-bold py-2.5 px-4 rounded-lg hover:bg-amber-700 transition shadow-sm"
            >
              {loading ? "Déconnexion forcée..." : "Forcer la déconnexion de l'autre appareil"}
            </button>
          </motion.div>
        )}

        <p className="text-gray-500 text-center text-sm mt-6">
          © 2026 Med-Contest — Tous droits réservés
        </p>
      </motion.div>
    </div>
  );
}