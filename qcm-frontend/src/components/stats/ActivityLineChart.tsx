import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ActivityLineChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-xl shadow h-[300px] flex items-center justify-center text-gray-400">
        Aucune activité
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow h-[300px]">
      <h3 className="font-semibold mb-2">📈 Activité dans le temps</h3>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="_id" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
