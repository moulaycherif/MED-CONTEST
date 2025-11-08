// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StudentPage from "./pages/StudentPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { API_BASE_URL } from "./config";

console.log("🌍 API_BASE_URL =", API_BASE_URL);

export default function App() {
  return (
    <Router>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <Routes>
          {/* 🏠 Page d’accueil */}
          <Route path="/" element={<HomePage />} />

          {/* 👨‍🎓 Page principale Étudiant */}
          <Route path="/student" element={<StudentPage />} />

          {/* 🔐 Page de connexion */}
          <Route path="/login" element={<LoginPage />} />

          {/* Autres pages simples */}
          <Route path="/demo" element={<div className="p-10 text-center">Page Démo</div>} />
          <Route path="/abonnement" element={<div className="p-10 text-center">Page Abonnement</div>} />
          <Route path="/contact" element={<div className="p-10 text-center">Page Contact</div>} />

          {/* 🚫 Route par défaut si l’URL n’existe pas */}
          <Route path="*" element={<div className="p-10 text-center text-red-500 font-bold">404 — Page non trouvée</div>} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}
