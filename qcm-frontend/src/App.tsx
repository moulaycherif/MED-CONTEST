import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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
import PdfPage from "./pages/PdfPage";
import api from "./api/axios";

// 🛡️ Composant de surveillance de session unique
function SessionGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    const verifySessionOnServer = async () => {
      const token = localStorage.getItem("token");
      const adminToken = localStorage.getItem("adminToken");

      if (!token && !adminToken) return;

      // Éviter de lancer une vérification si on est déjà en train de se connecter
      if (location.pathname === "/login") return;

      try {
        if (adminToken) {
          // 👨‍💼 Route test pour l'Admin
          await api.get("/api/auth/students");
        } else {
          // 👩‍🎓 Route test pour l'Étudiant (Doit être accessible aux étudiants !)
          // Remplacer par /api/auth/me ou n'importe quelle route profil étudiant valide
          await api.get("/api/auth/me"); 
        }
      } catch (err) {
        console.log("Échec de la vérification automatique de session.");
      }
    };

    verifySessionOnServer();
  }, [location.pathname]); 

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <SessionGuard>
        <Navbar />
        <main className="pt-16 min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/student/*" element={<StudentPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/demo" element={<div className="p-10 text-center">Page Démo</div>} />
            <Route path="/abonnement" element={<div className="p-10 text-center">Page Abonnement</div>} />
            <Route path="/contact" element={<div className="p-10 text-center">Page Contact</div>} />
            <Route path="/admin/exercises" element={<AdminExercises />} />
            <Route path="/admin/astuces" element={<AdminAstuces />} />
            <Route path="/student/astuces" element={<StudentAstuces />} />
            <Route path="/student/astuce/:id" element={<StudentAstuceDetail />} />
            <Route path="/student/quiz/:tipId" element={<StudentQuiz />} />
            <Route path="/student/pdf/:id" element={<PdfPage />} />
            <Route path="/*" element={<div className="p-10 text-center text-red-600 font-semibold">Page non trouvée</div>} />
          </Routes>
        </main>
        <Footer />
      </SessionGuard>
    </Router>
  );
}