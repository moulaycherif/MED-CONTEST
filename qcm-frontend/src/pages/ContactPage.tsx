// src/pages/ContactPage.tsx
import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundWrapper from "../components/BackgroundWrapper";

export default function ContactPage() {
  return (
    <BackgroundWrapper>
      <Navbar />
      <main className="flex flex-col min-h-screen items-center pt-24 pb-12 px-6">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-blue-700 mb-8"
        >
          📩 Nous Contacter
        </motion.h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
          <form className="flex flex-col gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Nom complet</label>
              <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Votre nom" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="votre@email.com" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Message</label>
              <textarea rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Comment pouvons-nous vous aider ?"></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
              Envoyer le message
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-3">Ou contactez-nous directement via WhatsApp :</p>
            <a
              href="https://wa.me/212650188863"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 bg-green-500 text-white font-bold rounded-lg shadow hover:bg-green-600 transition"
            >
              💬 +212 650 188 863
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </BackgroundWrapper>
  );
}