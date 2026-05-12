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
    <div className="bg-white rounded-2xl shadow p-4 h-[350px] min-w-0">
      <h3 className="text-lg font-semibold mb-4">
        📈 Activité dans le temps
      </h3>

      {/* CORRECTION : Ajout de h-[280px] sur le conteneur parent */}
      <div className="w-full h-[280px] min-w-0">
        {/* CORRECTION : Utilisation de height="100%" pour qu'il remplisse le parent */}
        <ResponsiveContainer width="100%" aspect={2}>
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