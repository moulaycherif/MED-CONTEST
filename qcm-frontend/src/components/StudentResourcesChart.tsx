import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function StudentResourcesChart({ data }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-3">📚 Ressources consultées</h3>

      <ResponsiveContainer width="50%" height={100}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="_id"
            label
          />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
