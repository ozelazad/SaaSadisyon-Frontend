import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const ToastContext = createContext({ toast: () => {} });

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const remove = useCallback((id) => setItems((prev) => prev.filter((t) => t.id !== id)), []);

  const toast = useCallback((opts) => {
    const id = (crypto?.randomUUID?.() || String(Date.now()));
    const next = { id, title: opts.title, description: opts.description, variant: opts.variant || "info" };
    setItems((prev) => [...prev, next]);
    setTimeout(() => remove(id), 3200);
  }, [remove]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed right-4 top-4 z-50 flex w-96 max-w-full flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
                item.variant === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : item.variant === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-800"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  {item.description ? <p className="text-xs text-slate-600">{item.description}</p> : null}
                </div>
                <button onClick={() => remove(item.id)} className="text-slate-400 transition hover:text-slate-600">✕</button>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
