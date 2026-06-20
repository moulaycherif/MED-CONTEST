// src/pages/DemoPage.tsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 💡 Ajustez le chemin selon votre structure de dossiers
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundWrapper from "../components/BackgroundWrapper";

export default function DemoPage() {
  const { loginGuest, logout } = useAuth(); // 🟢 Récupération de logout ajoutée
  const navigate = useNavigate();

 // 🟢 MODIFIÉ : On utilise un tableau de dépendances vide []
  // Le nettoyage se fait UNIQUEMENT quand on arrive sur la page, pas quand on clique.
  useEffect(() => {
    // 🚨 NETTOYAGE EXTRÊME : On supprime tout pour repartir à zéro
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    
    // On vide l'état global si nécessaire
    logout(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fonction déclenchée au clic sur le bouton de démo
  // On ajoute "async" ici
 const handleStartDemo = async () => {
    try {
      await loginGuest(); 
      
      // 🚨 NOUVEAU : On laisse 100ms à React pour mettre à jour ses variables globales
      setTimeout(() => {
        navigate("/student");
      }, 100);
    } catch (err) {
      console.error("Erreur lors de la connexion invité", err);
    }
  };

  return (
    <BackgroundWrapper>
      <Navbar />
      
      {/* bg-white pour conserver le fond blanc propre demandé sur vos pages */}
      <main className="flex flex-col min-h-screen items-center justify-center pt-24 pb-12 px-6 text-center bg-white">
        
        {/* Badge d'en-tête */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 px-4 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm inline-block"
        >
          👀 Accès Libre & Instantané
        </motion.div>

        {/* Titre principal animé */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-6 max-w-3xl leading-tight"
        >
          🚀 Essayez Med-Contest gratuitement
        </motion.h1>
        
        {/* Texte explicatif */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-gray-600 text-base md:text-lg max-w-2xl mb-10 leading-relaxed"
        >
          Explorez l'interface réelle utilisée par nos étudiants. En mode invité, vous pourrez parcourir librement les différentes sections (Concours, Matières, Soutien), mais l'affichage sera limité à un seul échantillon et les interactions seront restreintes.
        </motion.p>
        
        {/* Bouton d'action principal connecté au système d'authentification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <button 
            onClick={handleStartDemo}
            className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:bg-green-700 transition transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-green-200"
          >
            Lancer la visite guidée
          </button>
        </motion.div>

        {/* Note de réassurance sous le bouton */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-gray-400 mt-4 italic"
        >
          Aucune inscription ni carte bancaire requise.
        </motion.p>

      </main>
      
      <Footer />
    </BackgroundWrapper>
  );
}