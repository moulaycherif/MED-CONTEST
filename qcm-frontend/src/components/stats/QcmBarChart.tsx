import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function QcmBarChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-xl shadow h-[350px] flex items-center justify-center text-gray-400">
        Aucun QCM
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow h-[350px]">
      <h3 className="font-semibold mb-2">📊 QCM par matière</h3>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <XAxis dataKey="_id" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#4ade80" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
