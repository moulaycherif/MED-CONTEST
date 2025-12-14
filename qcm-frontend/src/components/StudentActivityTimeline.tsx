import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

type TimelineItem = {
  _id: string;   // date YYYY-MM-DD
  count: number; // nombre d’actions ce jour-là
};

export default function StudentActivityTimeline() {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/stats/student/TEMP_STUDENT_ID/timeline`)
      .then((res) => {
        setTimeline(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement activité...</p>;

  if (timeline.length === 0) {
    return <p>Aucune activité enregistrée.</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 mt-6">
      <h3 className="text-lg font-semibold mb-3">
        📈 Activité de l’étudiant (par jour)
      </h3>

      <ul className="space-y-2">
        {timeline.map((d) => (
          <li
            key={d._id}
            className="flex justify-between border-b pb-1"
          >
            <span>{d._id}</span>
            <span className="font-bold">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
