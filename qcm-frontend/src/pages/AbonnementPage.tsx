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
          💎 Notre Offre d'Abonnement
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 rounded-2xl shadow-2xl transform scale-105 flex flex-col text-white">
            <h2 className="text-2xl font-bold mb-2">Pémarche d'abonnemnt à l'application</h2>
            <p className="text-4xl font-extrabold text-yellow-400 mb-6">MED-CONTEST</p>
            <ul className="space-y-3 mb-8 flex-1">
              <li>✅ Nous contacter sur Whatsapp (ou par E-mail)</li>
              <li>✅ Procédez au paiement des frais d'abonnement</li>
              <li>✅ Screenez le reçu de confirmation de paiement et l'envoyer</li>
              <li>✅ Activation de votre compte</li>
            </ul>
            <button className="w-full py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-500 shadow-lg">
              💬 Discuter sur WhatsApp
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </BackgroundWrapper>
  );
}