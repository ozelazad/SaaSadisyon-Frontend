export default function Input({ label, helper, error, icon, type = "text", className = "", ...props }) {
  return (
    <label className={`flex flex-col gap-2 text-sm text-slate-700 ${className}`}>
      {label ? <span className="font-semibold text-slate-900">{label}</span> : null}
      <div className={`flex items-center gap-2 rounded-xl border ${error ? "border-red-300 ring-2 ring-red-100" : "border-slate-200 hover:border-slate-300 focus-within:ring-2 focus-within:ring-brand-200"} bg-white/90 px-3 py-2 shadow-sm transition`}>
        {icon ? <span className="text-slate-400">{icon}</span> : null}
        <input
          className="w-full border-none bg-transparent text-slate-900 placeholder:text-slate-400 outline-none"
          type={type}
          {...props}
        />
      </div>
      {helper ? <span className="text-xs text-slate-500">{helper}</span> : null}
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
