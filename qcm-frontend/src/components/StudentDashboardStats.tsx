import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import StudentActivityTimeline from "./StudentActivityTimeline";

export default function StudentDashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
  const url = `${API_BASE_URL}/api/stats/student/TEMP_STUDENT_ID`;
  console.log("📡 Appel API stats :", url);

  axios
    .get(url)
    .then((res) => {
      console.log("✅ Réponse stats :", res.data);
      setStats(res.data);
    })
    .catch((err) => {
      console.error("❌ Erreur stats", err);
      setError(true);
    });
}, []);


  if (error) return <p>❌ Impossible de charger les statistiques.</p>;
  if (!stats) return <p>Chargement statistiques...</p>;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded-xl shadow">
          📘 Concours<br />
          <b>{stats.concours.done} / {stats.concours.total}</b>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          📄 Résumés consultés<br />
          <b>
            {stats.resources.find((r: any) => r._id === "RESUME")?.count || 0}
          </b>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          💡 Astuces consultées<br />
          <b>
            {stats.resources.find((r: any) => r._id === "ASTUCE")?.count || 0}
          </b>
        </div>
      </div>

      {/* Timeline */}
      <StudentActivityTimeline />
    </div>
  );
}
