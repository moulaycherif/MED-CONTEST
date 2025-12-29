import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

export default function ActivityLineChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-xl shadow h-[350px] flex items-center justify-center text-gray-400">
        Aucune activité
      </div>
    );
  }

  // Formater les dates pour plus de lisibilité
  const formattedData = data.map((item) => ({
    ...item,
    date: dayjs(item._id).format("DD/MM/YYYY"),
  }));

  return (
    <div className="bg-white p-4 rounded-xl shadow h-[350px]">
      <h3 className="font-semibold mb-2">📈 Résumés consultés</h3>

      <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
