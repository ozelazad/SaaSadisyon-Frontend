import LogoutButton from "./LogoutButton.jsx";
import Badge from "./ui/Badge.jsx";

function decode(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    return payload;
  } catch (e) {
    return {};
  }
}

export default function Topbar() {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role") || decode(token).role || "User";
  const customer = localStorage.getItem("customerName") || localStorage.getItem("cid") || "Branch";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white text-lg font-bold">
          AS
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Adisyon SaaS</p>
          <div className="text-sm font-semibold text-slate-900">{customer}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-700">
        <Badge color="blue">{role}</Badge>
        <div className="hidden md:block text-right">
          <p className="text-xs text-slate-500">Signed in</p>
          <p className="text-sm font-semibold text-slate-900">{customer}</p>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
