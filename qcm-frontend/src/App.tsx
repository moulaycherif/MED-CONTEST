// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import StudentPage from "./pages/StudentPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminExercices from "./pages/AdminExercices";

export default function App() {
  return (
      <Router>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <Routes>
          {/* 🏠 Page d’accueil */}
          <Route path="/" element={<HomePage />} />

          {/* 🔐 Connexion */}
          <Route path="/login" element={<LoginPage />} />

          {/* 👩‍🎓 Espace étudiant */}
          <Route path="/student" element={<StudentPage />} />

          {/* 👨‍💼 Espace admin */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* 🧩 Pages futures */}
          <Route path="/demo" element={<div className="p-10 text-center">Page Démo</div>} />
          <Route path="/abonnement" element={<div className="p-10 text-center">Page Abonnement</div>} />
          <Route path="/contact" element={<div className="p-10 text-center">Page Contact</div>} />

          {/* 🚫 404 */}
          <Route path="*" element={<div className="p-10 text-center text-red-600 font-semibold">Page non trouvée</div>} />

          <Route path="/admin/exercices" element={<AdminExercices />} />

        </Routes>
      </main>
      <Footer />
    </Router>
  );
}
