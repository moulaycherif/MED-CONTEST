// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import StudentQuiz from "./pages/StudentQuiz";

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
