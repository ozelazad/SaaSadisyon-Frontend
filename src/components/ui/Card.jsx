export default function Card({ title, action, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white/80 shadow-card backdrop-blur-sm ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
