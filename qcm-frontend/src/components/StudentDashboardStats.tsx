import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import StudentActivityTimeline from "./StudentActivityTimeline";

export default function StudentDashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/stats/student/TEMP_STUDENT_ID`)
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Erreur stats étudiant :", err);
        setError("Impossible de charger les statistiques");
        setLoading(false);
      });
  }, []);

  // ⏳ Chargement
  if (loading) {
    return <p className="text-center mt-10">⏳ Chargement statistiques...</p>;
  }

  // ❌ Erreur API
  if (error) {
    return (
      <p className="text-center mt-10 text-red-600 font-semibold">
        {error}
      </p>
    );
  }

  // Sécurité
  if (!stats) {
    return (
      <p className="text-center mt-10 text-gray-600">
        Aucune statistique disponible
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* 📊 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded-xl shadow">
          📘 Concours<br />
          <b>
            {stats.concours?.done ?? 0} / {stats.concours?.total ?? 0}
          </b>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          📄 Résumés consultés<br />
          <b>
            {stats.resources?.find((r: any) => r._id === "RESUME")?.count || 0}
          </b>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          💡 Astuces consultées<br />
          <b>
            {stats.resources?.find((r: any) => r._id === "ASTUCE")?.count || 0}
          </b>
        </div>
      </div>

      {/* ⏱️ Timeline */}
      <StudentActivityTimeline />
    </div>
  );
}
