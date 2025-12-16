import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import StudentActivityTimeline from "./StudentActivityTimeline";
import QcmBarChart from "./QcmBarChart";
import StudentRanking from "./StudentRanking";

export default function StudentDashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/stats/student/TEMP_STUDENT_ID`)
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.error("❌ Erreur stats frontend :", err);
        setError("Impossible de charger les statistiques");
      });
  }, []);

  if (error) {
    return (
      <p className="text-red-600 font-semibold text-center mt-10">
        {error}
      </p>
    );
  }

  if (!stats) {
    return (
      <p className="text-gray-600 text-center mt-10">
        Chargement statistiques...
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded-xl shadow">
          📘 Concours<br />
          <b>{stats.concours?.done ?? 0} / {stats.concours?.total ?? 0}</b>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          📄 Résumés consultés<br />
          <b>
            {stats.resources?.find((r:any)=>r._id==="RESUME")?.count || 0}
          </b>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          💡 Astuces consultées<br />
          <b>
            {stats.resources?.find((r:any)=>r._id==="ASTUCE")?.count || 0}
          </b>
        </div>
      </div>

      {/* 📈 Graphiques */}
      <QcmBarChart />
      <StudentActivityTimeline />
      <StudentRanking />
    </div>
  );
}
