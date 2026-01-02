import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { API_BASE_URL } from "../config";

export default function StudentActivityTimeline() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
  const token = localStorage.getItem("token");

  axios
    .get(`${API_BASE_URL}/api/stats/student/timeline`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(res => setData(res.data))
    .catch(() => setData([]));
}, []);

  if (!data.length) return <p>Aucune activité enregistrée</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-3">📈 Résumés Consultés</h3>

      <ResponsiveContainer width="150%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
