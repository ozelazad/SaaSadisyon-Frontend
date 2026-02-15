export default function Badge({ children, color = "slate", pill = true }) {
  const colors = {
    slate: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    green: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    yellow: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    red: "bg-red-100 text-red-700 ring-1 ring-red-200",
    blue: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold ${pill ? "rounded-full" : "rounded-md"} ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
}
