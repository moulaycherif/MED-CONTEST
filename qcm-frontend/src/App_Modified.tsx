// src/App.tsx
import React from "react";
import StudentDashboardFull from "./pages/StudentDashboardFull";

function App() {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex justify-center items-start"
      /*style={{
        backgroundImage: `url(${process.env.PUBLIC_URL + '/bg-qcm.jpg'})`,
        filter: "brightness(0.75)", // filtre sombre pour mieux voir le texte
      }}*/
    >
      <div className="w-full max-w-7xl p-6">
        <StudentDashboardFull />
      </div>
    </div>
  );
}

export default App;
