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
    axios
      .get(`${API_BASE_URL}/api/stats/student/TEMP_STUDENT_ID/timeline`)
      .then(res => setData(res.data))
      .catch(() => setData([]));
  }, []);

  if (!data.length) return <p>Aucune activité enregistrée</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-3">📈 Activité dans le temps</h3>

      <ResponsiveContainer width="50%" height={100}>
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
