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
        {/* Titre de la page */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-blue-700 mb-8 text-center"
        >
          💎 Notre Offre d'Abonnement
        </motion.h1>
        
        {/* Conteneur de la carte centré */}
        <div className="w-full max-w-md mx-auto flex justify-center">
         
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 rounded-2xl shadow-2xl transform scale-105 flex flex-col text-white w-full">
            
            {/* TEXTES CENTRÉS */}
            <h2 className="text-2xl font-bold mb-2 text-center">
              Démarche d'abonnement à l'application
            </h2>
            <p className="text-4xl font-extrabold text-yellow-400 mb-6 text-center">
              MED-CONTEST
            </p>
            
            {/* TEXTE JUSTIFIÉ (Aligné à droite et à gauche) */}
            <ul className="space-y-3 mb-8 flex-1 text-justify">
              <li>✅ Nous contacter sur Whatsapp (ou par E-mail)</li>
              <li>✅ Procédez au paiement des frais d'abonnement</li>
              <li>✅ Screenez le reçu de confirmation de paiement et l'envoyer</li>
              <li>✅ Activation de votre compte</li>
            </ul>
            <a
          href="https://wa.me/212650188863" // Remplace le numéro par ton vrai numéro WhatsApp
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2 bg-green-500 rounded-lg shadow hover:bg-green-600 transition"
        >
          💬 Discuter sur WhatsApp
        </a>
          
          </div>

        </div>
      </main>
      <Footer />
    </BackgroundWrapper>
  );
}