// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import StudentPage from "./pages/StudentPage"; // ✅ utilise StudentPage au lieu de StudentQuiz
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";

import { API_BASE_URL } from "./config";
console.log("🌍 API_BASE_URL =", API_BASE_URL);

export default function App() {
  return (
    <Router>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* ✅ On garde une seule page StudentPage */}
          <Route path="/student" element={<StudentPage />} />

          <Route path="/login" element={<LoginPage />} />

          {/* Pages à venir */}
          <Route path="/demo" element={<div className="p-10 text-center">Page Démo</div>} />
          <Route path="/abonnement" element={<div className="p-10 text-center">Page Abonnement</div>} />
          <Route path="/contact" element={<div className="p-10 text-center">Page Contact</div>} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}
