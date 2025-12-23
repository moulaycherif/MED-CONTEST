import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function QcmBarChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-500">Aucun QCM traité</p>;
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-2">📊 QCM par matière</h3>

      <div className="bg-white p-4 rounded-xl shadow h-[220px]">
      <ResponsiveContainer width="50%" height="100%">
    {/* chart */}
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
