import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md shadow-md z-50 px-8 py-4 flex justify-between items-center">
      {/* Logo à gauche */}
      <Link
        to="/"
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

      {/* Bouton à droite */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Connexion
        </button>
      </div>
    </nav>
  );
}
