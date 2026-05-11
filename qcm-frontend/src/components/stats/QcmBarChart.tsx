import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Props {
  data: {
    _id: string;
    count: number;
  }[];
}

export default function QcmBarChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow h-[350px] flex items-center justify-center text-gray-400">
        Aucun QCM disponible
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4 h-[350px]">
      <h3 className="text-lg font-semibold mb-4">
        📊 QCM par matière
      </h3>

      <div className="w-full">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="_id" />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Bar
              dataKey="count"
              fill="#4ade80"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}