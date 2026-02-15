import { useEffect } from "react";
import Button from "./Button.jsx";

export default function Modal({ open, title, children, onClose, actions }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 transition hover:text-slate-600">✕</button>
        </div>
        <div className="p-5">{children}</div>
        {actions ? <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-4">{actions}</div> : null}
      </div>
    </div>
  );
}
