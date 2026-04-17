// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import StudentPage from "./pages/StudentPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminExercises from "./pages/AdminExercises";
import AdminAstuces from "./pages/AdminAstuces";
import StudentAstuces from "./pages/StudentAstuces";
import StudentAstuceDetail from "./pages/StudentAstuceDetail";
import StudentQuiz from "./pages/StudentQuiz";

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
          <Route path="/admin/exercises" element={<AdminExercises />} />
          <Route path="/admin/astuces" element={<AdminAstuces />} />
          <Route path="/student/astuces" element={<StudentAstuces />} />
          <Route path="/student/astuces/:id" element={<StudentAstuceDetail />} />
          <Route path="/student/quiz/:tipId" element={<StudentQuiz />} />
          <Route path="/student/astuce/:id" element={<StudentAstuceDetail />} />


          {/* 🚫 404 */}
          <Route path="*" element={<div className="p-10 text-center text-red-600 font-semibold">Page non trouvée</div>} />

        </Routes>
      </main>
      <Footer />
    </Router>
  );
}
