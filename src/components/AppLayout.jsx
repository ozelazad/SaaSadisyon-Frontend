import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppLayout() {
  const role = localStorage.getItem("role");
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar role={role} />
      <div className="relative flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-5">
            <Breadcrumb path={location.pathname} navigate={navigate} />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function Breadcrumb({ path, navigate }) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  const crumbs = parts.map((p, idx) => ({ name: p, href: "/" + parts.slice(0, idx + 1).join("/") }));
  return (
    <nav className="text-xs text-slate-500" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        <li
          className="cursor-pointer rounded-md px-2 py-1 transition hover:bg-slate-100 hover:text-slate-700"
          onClick={() => navigate("/dashboard")}
        >
          Home
        </li>
        {crumbs.map((c) => (
          <li key={c.href} className="flex items-center gap-2">
            <span>/</span>
            <span className="capitalize rounded-md px-2 py-1 text-slate-700 hover:bg-slate-100">{c.name}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
