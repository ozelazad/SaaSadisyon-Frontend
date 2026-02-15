export default function Table({ columns = [], data = [], empty }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50/80">
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={columns.length}>
                {empty || "No data"}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id || idx} className="transition hover:bg-slate-50">
                {columns.map((col) => (
                  <td key={col.accessor} className="px-4 py-3 text-sm text-slate-800">
                    {typeof col.cell === "function" ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
