import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import StudentActivityTimeline from "./StudentActivityTimeline";
import StudentResourcesChart from "./StudentResourcesChart";

export default function StudentDashboardStats() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/stats/student/TEMP_STUDENT_ID`)
      .then(res => setStats(res.data))
      .catch(() => setStats(null));
  }, []);

  if (!stats) return <p>Chargement statistiques...</p>;

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
      </div>

      {/* Graphiques */}
      <StudentResourcesChart data={stats.byType} />
      <StudentActivityTimeline />
    </div>
  );
}
