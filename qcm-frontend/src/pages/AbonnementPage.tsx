// src/pages/AbonnementPage.tsx
import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundWrapper from "../components/BackgroundWrapper";

export default function AbonnementPage() {
  return (
    <BackgroundWrapper>
      <Navbar />
      <main className="flex flex-col min-h-screen items-center pt-24 pb-12 px-6">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-blue-700 mb-8"
        >
          💎 Nos Offres d'Abonnement
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Carte Gratuit */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Accès Découverte</h2>
            <p className="text-4xl font-extrabold text-blue-600 mb-6">Gratuit</p>
            <ul className="text-gray-600 space-y-3 mb-8 flex-1">
              <li>✅ Accès à la démo interactive</li>
              <li>✅ Quelques astuces de base</li>
              <li>❌ Suivi statistique</li>
            </ul>
            <button className="w-full py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300">
              Déjà inclus
            </button>
          </div>

          {/* Carte Premium */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 rounded-2xl shadow-2xl transform scale-105 flex flex-col text-white">
            <h2 className="text-2xl font-bold mb-2">Pack Réussite Médecine</h2>
            <p className="text-4xl font-extrabold text-yellow-400 mb-6">XXX Dhs</p>
            <ul className="space-y-3 mb-8 flex-1">
              <li>✅ QCE illimités (Tous les concours)</li>
              <li>✅ Examens blancs chronométrés</li>
              <li>✅ Espace Soutien & Astuces complet</li>
              <li>✅ Suivi intelligent & Statistiques</li>
            </ul>
            <button className="w-full py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-500 shadow-lg">
              Souscrire maintenant
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </BackgroundWrapper>
  );
}