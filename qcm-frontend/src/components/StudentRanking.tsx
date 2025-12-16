export default function StudentRanking({ data }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-bold mb-4">🏆 Classement</h3>
      <ol>
        {data.map((d: any, i: number) => (
          <li key={d._id}>
            #{i + 1} — {d._id} ({d.total} QCM)
          </li>
        ))}
      </ol>
    </div>
  );
}
