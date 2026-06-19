// src/pages/DemoPage.tsx
import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundWrapper from "../components/BackgroundWrapper";
import { Link } from "react-router-dom";

export default function DemoPage() {
  return (
    <BackgroundWrapper>
      <Navbar />
      <main className="flex flex-col min-h-screen items-center justify-center pt-24 pb-12 px-6 text-center">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl font-bold text-blue-700 mb-6"
        >
          🚀 Essayez Med-Contest gratuitement
        </motion.h1>
        <p className="text-lg text-gray-700 max-w-2xl mb-8">
          Testez notre plateforme avec un mini-concours blanc. Découvrez l'interface, répondez à quelques questions types et voyez comment notre système corrige vos erreurs.
        </p>
        
        <Link 
          to="/student" // Redirige vers la page étudiant ou une page spécifique de QCM d'essai
          className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:bg-green-700 transition transform hover:scale-105"
        >
          Lancer le QCM de Démo
        </Link>
      </main>
      <Footer />
    </BackgroundWrapper>
  );
}