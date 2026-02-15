export default function Button({
  children,
  variant = "primary",
  size = "md",
  full = false,
  icon,
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
}) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-400 shadow-sm",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-300",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-200",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400",
  };
  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const classes = [
    base,
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    full ? "w-full" : "",
    loading || disabled ? "opacity-70 cursor-not-allowed" : "",
    className,
  ].join(" ").trim();

  return (
    <button type={type} onClick={onClick} className={classes} disabled={loading || disabled}>
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
          <span>Processing...</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">{icon} {children}</span>
      )}
    </button>
  );
}
