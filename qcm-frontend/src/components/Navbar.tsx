import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios"; // 👈 Votre instance axios configurée

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1️⃣ On crée un état React pour l'authentification (inititialisé avec la valeur actuelle du token)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem("token")
  );

  // 2️⃣ Écouteur automatique : Chaque fois que l'utilisateur change de page (ex: arrive du Login),
  // ou qu'un événement d'authentification a lieu, on recalcule l'état du bouton.
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    checkAuth(); // Vérification à chaque changement de route (location.pathname)

    // Optionnel mais recommandé : écoute un événement personnalisé si la page de Login n'utilise pas de redirection brute
    window.addEventListener("authChange", checkAuth);
    window.addEventListener("storage", checkAuth); // Utile si l'état change depuis un autre onglet

    return () => {
      window.removeEventListener("authChange", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, [location.pathname]); // 👈 Déclencheur magique : s'exécute dès que l'URL change

  // 🔒 Logique de déconnexion propre (Backend + Frontend)
  const handleLogout = async () => {
    try {
      // 1. On prévient le backend pour libérer les champs de session (currentSessionId) dans MongoDB
      await api.post("/api/auth/logout"); 
    } catch (err) {
      console.error("Erreur lors de la déconnexion backend :", err);
    } finally {
      // 2. Dans tous les cas, on nettoie le navigateur
      localStorage.removeItem("token");
      setIsAuthenticated(false); // 👈 On met à jour l'état immédiatement
      navigate("/");
    }
  };

  // 🩺 Gestion de la fermeture/déconnexion via le bouton "Med-Contest"
  const handleLogoClick = (e: React.MouseEvent) => {
    if (isAuthenticated) {
      e.preventDefault(); // On stoppe le lien direct du <Link>
      if (confirm("Voulez-vous fermer l'application et vous déconnecter ?")) {
        handleLogout();
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md shadow-md z-50 px-8 py-4 flex justify-between items-center">
      {/* Logo à gauche (Déconnecte proprement si connecté) */}
      <Link
        to="/"
        onClick={handleLogoClick}
        className="text-2xl font-bold text-blue-700 hover:text-blue-500 transition"
      >
        🩺 Med-Contest
      </Link>

      {/* Liens au centre */}
      <div className="hidden md:flex gap-6 text-gray-700 font-medium">
        <Link to="/" className="hover:text-blue-500 transition">Accueil</Link>
        <Link to="/demo" className="hover:text-blue-500 transition">Démo</Link>
        <Link to="/abonnement" className="hover:text-blue-500 transition">Abonnement</Link>
        <Link to="/contact" className="hover:text-blue-500 transition">Contact</Link>
      </div>

      {/* Bouton à droite : Conditionnel et désormais 100% dynamique */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition font-medium"
          >
            Déconnexion
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition font-medium"
          >
            Connexion
          </button>
        )}
      </div>
    </nav>
  );
}