import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function StudentQCMBySubjectChart({ data }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-3">📊 QCM par matière</h3>

      <div className="w-full h-[300px]">
      <ResponsiveContainer width="150%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
