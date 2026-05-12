import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

interface Props {
  data: {
    _id: string;
    count: number;
  }[];
}

const COLORS = [
  "#60a5fa",
  "#facc15",
  "#4ade80",
  "#c084fc",
];

export default function StudentResourcesChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-400">
        Aucune ressource consultée
      </div>
    );
  }

  return (
   <div className="bg-white p-4 rounded-xl shadow h-[350px] min-w-0">
  <h3 className="font-semibold mb-2">
    📚 Ressources consultées
  </h3>

  <ResponsiveContainer width="100%" height={280}>
    <PieChart>
     
 <Pie
              data={data}
              dataKey="count"
              nameKey="_id"
              outerRadius={120}
              label
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
</div>
  );
}