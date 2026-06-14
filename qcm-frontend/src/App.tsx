// src/App.tsx
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
import api from "./api/axios"; // 👈 Importation de votre instance axios configurée

// 🛡️ Composant de surveillance de session unique
function SessionGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    const verifySessionOnServer = async () => {
      const token = localStorage.getItem("token");
      const adminToken = localStorage.getItem("adminToken");

      // Si l'utilisateur n'est pas connecté, inutile de vérifier
      if (!token && !adminToken) return;

      try {
        if (adminToken) {
          // Si c'est un admin, on teste une route protégée par l'auth admin (ex: la liste des étudiants)
          await api.get("/api/auth/students");
        } else {
          // Si c'est un étudiant, on teste n'importe quelle route nécessitant l'authentification étudiant
          await api.get("/api/auth/students"); 
        }
      } catch (err) {
        // L'intercepteur global défini dans api/axios.ts interceptera l'erreur 403 (SESSION_KICKED)
        // et videra le localStorage tout en redirigeant vers /login automatiquement.
        console.log("Vérification de session exécutée.");
      }
    };

    verifySessionOnServer();
  }, [location.pathname]); // 🔥 S'exécute magiquement à CHAQUE changement de page !

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <SessionGuard>
        <Navbar />
        <main className="pt-16 min-h-screen">
          <Routes>
            {/* 🏠 Page d’accueil */}
            <Route path="/" element={<HomePage />} />

            {/* 🔐 Connexion */}
            <Route path="/login" element={<LoginPage />} />

            {/* 👩‍🎓 Espace étudiant */}
            <Route path="/student/*" element={<StudentPage />} />

            {/* 👨‍💼 Espace admin */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* 🧩 Pages fonctionnelles */}
            <Route path="/demo" element={<div className="p-10 text-center">Page Démo</div>} />
            <Route path="/abonnement" element={<div className="p-10 text-center">Page Abonnement</div>} />
            <Route path="/contact" element={<div className="p-10 text-center">Page Contact</div>} />
            <Route path="/admin/exercises" element={<AdminExercises />} />
            <Route path="/admin/astuces" element={<AdminAstuces />} />
            <Route path="/student/astuces" element={<StudentAstuces />} />
            <Route path="/student/astuce/:id" element={<StudentAstuceDetail />} />
            <Route path="/student/quiz/:tipId" element={<StudentQuiz />} />
            <Route path="/student/pdf/:id" element={<PdfPage />} />

            {/* 🚫 404 */}
            <Route path="*" element={<div className="p-10 text-center text-red-600 font-semibold">Page non trouvée</div>} />
          </Routes>
        </main>
        <Footer />
      </SessionGuard>
    </Router>
  );
}