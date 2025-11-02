// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import StudentQuiz from "./pages/StudentQuiz";

import { API_BASE_URL } from "./config";
console.log("🌍 API_BASE_URL =", API_BASE_URL);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/exam/:examName" element={<StudentQuiz />} />
      </Routes>
    </Router>
  );
}
