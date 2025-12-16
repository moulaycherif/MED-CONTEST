export default function QcmBarChart({ data }: any) {
  if (!data.length) return <p>Aucun QCM effectué</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-bold mb-4">📊 QCM par matière</h3>
      <ul>
        {data.map((d: any) => (
          <li key={d._id}>{d._id} : {d.count}</li>
        ))}
      </ul>
    </div>
  );
}
