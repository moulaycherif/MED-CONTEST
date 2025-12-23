import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function ActivityLineChart({ data }: { data: any[] }) {
 if (!data || data.length === 0) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-2">📈 Activité dans le temps</h3>
      <p className="text-gray-500">Aucune activité temporelle</p>
    </div>
  );
}


  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-2">📈 Activité dans le temps</h3>

      <div className="bg-white p-4 rounded-xl shadow h-[220px]">
        <ResponsiveContainer width="50%" height="100%">
        {/* chart */}
          <LineChart data={data}>
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" />
          </LineChart>
   
        </ResponsiveContainer>
      </div>

    </div>
  );
}
