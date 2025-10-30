import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔹 Fonction déconnexion (pour l’instant : redirige vers HomePage)
  const handleLogout = () => {
    // 👉 Ici tu pourras vider le token du localStorage plus tard
    // localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 shadow-md flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold hover:text-yellow-300">
        📘 QCM App
      </Link>

      {/* Liens */}
      <div className="flex gap-6 items-center">
        <Link
          to="/dashboard"
          className={`hover:text-yellow-300 ${
            location.pathname.startsWith("/dashboard") ? "text-yellow-400" : ""
          }`}
        >
          🎓 Étudiant
        </Link>

        <Link
          to="/admin"
          className={`hover:text-yellow-300 ${
            location.pathname.startsWith("/admin") ? "text-yellow-400" : ""
          }`}
        >
          🛠️ Admin
        </Link>

        <Link
          to="/stats"
          className={`hover:text-yellow-300 ${
            location.pathname.startsWith("/stats") ? "text-yellow-400" : ""
          }`}
        >
          📊 Statistiques
        </Link>

        {/* 🔹 Bouton Déconnexion */}
        <button
          onClick={handleLogout}
          className="ml-4 px-4 py-2 bg-red-500 rounded hover:bg-red-600"
        >
          🚪 Déconnexion
        </button>
      </div>
    </nav>
  );
}
