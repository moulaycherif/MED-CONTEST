import { useEffect, useState } from "react";
import api from "../../api/axios";
import QcmBarChart from "./QcmBarChart";
import ActivityLineChart from "./ActivityLineChart";

interface Resource {
  _id: string;
  count: number;
}

interface RankingItem {
  _id: string; // studentId
  total: number;
}

interface Stats {
  timeline: { _id: string; count: number }[];
  qcmBySubject: { _id: string; count: number }[];
  resources: Resource[];
  ranking: RankingItem[];
}

export default function StudentDashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await api.get("/api/stats/student");
      setStats(res.data);
    } catch (err) {
      console.error("Erreur récupération stats :", err);
    }
  };

  fetchStats();
}, []);


  if (!stats) return <p className="text-center mt-10">Chargement statistiques...</p>;

  // 📊 KPIs
  const countResource = (type: string) => stats.resources.find(r => r._id === type)?.count || 0;

  return (
    <div className="space-y-8">
      {/* 🔹 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded-xl shadow text-center">
          📄 Résumés<br />
          <b>{countResource("RESUME")}</b>
        </div>

        <div className="p-4 bg-white rounded-xl shadow text-center">
          💡 Astuces<br />
          <b>{countResource("ASTUCE")}</b>
        </div>

        <div className="p-4 bg-white rounded-xl shadow text-center">
          🧩 QCM<br />
          <b>{countResource("QCM")}</b>
        </div>
      </div>

      {/* 🔹 Graphes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        
            <QcmBarChart data={stats.qcmBySubject} />
               
            <ActivityLineChart data={stats.timeline} />
         
      </div>

      {/* 🔹 Classement étudiant */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold text-center mb-4">🏆 Classement étudiant</h3>
        {stats.ranking.length === 0 ? (
          <p className="text-center text-gray-500">Aucune activité enregistrée.</p>
        ) : (
          <ol className="list-decimal list-inside">
            {stats.ranking.map((r, idx) => (
              <li key={r._id}>
                {r._id} — {r.total} QCM
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
