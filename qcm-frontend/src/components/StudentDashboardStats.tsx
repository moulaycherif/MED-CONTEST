import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import StudentActivityTimeline from "./StudentActivityTimeline";
import QcmBarChart from "./QcmBarChart";
import StudentRanking from "./StudentRanking";

export default function StudentDashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const studentId = localStorage.getItem("studentId"); // 🔑 JWT plus tard

  useEffect(() => {
    if (!studentId) return;

    axios
      .get(`${API_BASE_URL}/api/stats/student/${studentId}`)
      .then((res) => setStats(res.data))
      .catch(() => setStats(null));
  }, [studentId]);

  if (!stats) return <p className="text-center">Impossible de charger les statistiques</p>;

  return (
    <div className="space-y-10">
      {/* 📈 Timeline */}
      <StudentActivityTimeline data={stats.timeline} />

      {/* 📊 Bar chart QCM */}
      <QcmBarChart data={stats.qcmBySubject} />

      {/* 🏆 Classement */}
      <StudentRanking data={stats.ranking} />
    </div>
  );
}
