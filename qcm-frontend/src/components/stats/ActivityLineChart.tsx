import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import dayjs from "dayjs";

interface Props {
  data: {
    _id: string;
    count: number;
  }[];
}

export default function ActivityLineChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow h-[350px] flex items-center justify-center text-gray-400">
        Aucune activité disponible
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    date: dayjs(item._id).format("DD/MM"),
  }));

  return (
    <div className="bg-white rounded-2xl shadow p-4 h-[350px]">
      <h3 className="text-lg font-semibold mb-4">
        📈 Activité dans le temps
      </h3>

      <div className="w-full">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="count"
              stroke="#60a5fa"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}