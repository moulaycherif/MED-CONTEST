import { useEffect, useState } from "react";
import api from "../../api/axios";
import QcmBarChart from "./QcmBarChart";
import ActivityLineChart from "./ActivityLineChart";

export default function StudentDashboardStats() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get("/api/stats/student").then((res) => {
      setStats(res.data);
    });
  }, []);

  if (!stats) return <p>Chargement statistiques...</p>;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded-xl shadow">
          📄 Résumés<br />
          <b>{stats.resources.find((r:any)=>r._id==="RESUME")?.count || 0}</b>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          💡 Astuces<br />
          <b>{stats.resources.find((r:any)=>r._id==="ASTUCE")?.count || 0}</b>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          🧩 QCM<br />
          <b>{stats.resources.find((r:any)=>r._id==="QCM")?.count || 0}</b>
        </div>
      </div>

      {/* Graphes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QcmBarChart data={stats.qcmBySubject} />
        <ActivityLineChart data={stats.timeline} />
      </div>
    </div>
  );
}
