import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import StudentActivityTimeline from "./StudentActivityTimeline";
import StudentResourcesChart from "./StudentResourcesChart";

export default function StudentDashboardStats() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
     axios.get(`${API_BASE_URL}/api/stats/student/me`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});
  }, []);

  if (!stats) return <p>Chargement statistiques...</p>;

  const studentTotal = stats.comparison.student;
  const average = stats.comparison.average;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded-xl shadow">
          📄 Résumés<br />
          <b>{stats.byType.find((x:any)=>x._id==="RESUME")?.count || 0}</b>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          💡 Astuces<br />
          <b>{stats.byType.find((x:any)=>x._id==="ASTUCE")?.count || 0}</b>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          📝 QCM<br />
          <b>{stats.byType.find((x:any)=>x._id==="QCM")?.count || 0}</b>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          📈 Ton activité QCM vs moyenne<br />
          <b>{studentTotal} / {average.toFixed(1)}</b>
        </div>
      </div>

      {/* Graphiques */}
      <StudentResourcesChart data={stats.byType} />
      <StudentActivityTimeline />
    </div>
  );
}
