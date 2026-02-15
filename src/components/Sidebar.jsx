import { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import Button from "./ui/Button.jsx";

const iconMap = {
  dashboard: "📊",
  pos: "🧾",
  products: "🛒",
  tables: "🪑",
  reports: "📈",
  staff: "👥",
  admin: "🛡️",
};

export default function Sidebar({ role }) {
  const [collapsed, setCollapsed] = useState(false);

  const items = useMemo(() => {
    const base = [
      { to: "/dashboard", label: "Dashboard", icon: iconMap.dashboard },
      { to: "/pos", label: "POS", icon: iconMap.pos },
      { to: "/products", label: "Products", icon: iconMap.products },
      { to: "/tables", label: "Tables", icon: iconMap.tables },
      { to: "/reports", label: "Reports", icon: iconMap.reports },
    ];
    if (role === "PLATFORM_ADMIN") base.push({ to: "/admin", label: "Admin", icon: iconMap.admin });
    return base;
  }, [role]);

  return (
    <aside
      className={`flex h-full flex-col border-r border-slate-200 bg-white/90 shadow-sm backdrop-blur transition-all ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white font-bold">
            AS
          </div>
          {!collapsed ? <span className="text-sm font-semibold text-slate-900">SaaSadisyon</span> : null}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCollapsed((v) => !v)}>
          {collapsed ? "›" : "‹"}
        </Button>
      </div>
      <nav className="flex-1 space-y-1 px-2 pb-6">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-gradient-to-r from-brand-50 to-white text-brand-700 ring-1 ring-brand-100"
                  : "text-slate-700 hover:bg-slate-100"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed ? <span>{item.label}</span> : null}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
