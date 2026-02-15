import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";

function decodeRole(token) {
  if (!token) return undefined;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    return payload.role;
  } catch (e) {
    return undefined;
  }
}

export default function Login() {
  const [email, setEmail] = useState("manager@example.com");
  const [password, setPassword] = useState("Passw0rd!");
  const [customerId] = useState(localStorage.getItem("cid") || "9076d80d-b0b0-497c-93d2-39c2e46a848a");
  const [adminMode, setAdminMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const from = location.state?.from?.pathname;

  const passwordType = useMemo(() => (showPassword ? "text" : "password"), [showPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (adminMode) {
        const { data } = await api.post("/auth/platform/login", { email, password });
        // Platform admin endpoint dönen token vermiyor; guard'ları geçmek için hafif bir işaretleyici koyuyoruz.
        const fakeToken = `platform-${Date.now()}`;
        localStorage.setItem("accessToken", fakeToken);
        localStorage.setItem("role", "PLATFORM_ADMIN");
        localStorage.removeItem("cid");
        if (remember) {
          localStorage.setItem("rememberEmail", email);
        }
        toast({ title: "Welcome", description: `Platform admin (${data.admin?.email})`, variant: "success" });
        navigate("/admin", { replace: true });
        return;
      }

      const { data } = await api.post("/auth/login", { email, password, customer_id: customerId || undefined });
      const accessToken = data.accessToken || data.token || data.access;
      const role = data.role || data.user?.role || decodeRole(accessToken);
      const customerFromApi = data.customer_id || data.customerId || data.user?.customer_id || customerId;

      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (role) localStorage.setItem("role", role);
      if (customerFromApi) localStorage.setItem("cid", customerFromApi);
      if (remember) {
        localStorage.setItem("rememberEmail", email);
        localStorage.setItem("rememberCustomer", customerFromApi);
      }

      toast({ title: "Welcome", description: "Login successful", variant: "success" });

      if (role === "PLATFORM_ADMIN") {
        navigate("/admin", { replace: true });
      } else if (from && from !== "/login" && from !== "/") {
        navigate(from, { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      toast({ title: "Login failed", description: msg, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 text-slate-50">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="relative hidden h-full flex-col justify-between bg-gradient-to-br from-brand-500/90 via-indigo-600/90 to-slate-900/90 p-10 text-white lg:flex">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/80">Adisyon SaaS</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight">Modern POS &amp; restoran yönetimi</h2>
              <p className="mt-3 text-sm text-white/80">Siparişleri, mutfağı ve masaları tek ekrandan yönetin.</p>
            </div>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">⚡</span>
                <div>
                  <p className="font-semibold text-white">Hızlı kurulum</p>
                  <p>Vite + Tailwind hazır, sadece giriş yapın.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">🧾</span>
                <div>
                  <p className="font-semibold text-white">POS &amp; mutfak senk</p>
                  <p>Menü, masa ve mutfak aynı veri üzerinde.</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-white/60">Demo: manager@example.com / Passw0rd!</div>
          </div>

          <div className="relative bg-white/90 p-8 text-slate-900 lg:p-10">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white font-bold">
                AS
              </div>
              <h1 className="text-2xl font-bold">Hoş geldiniz</h1>
              <p className="text-sm text-slate-600">Hesabınıza giriş yapın ve siparişleri yönetin.</p>
            </div>

            <Card className="shadow-none border border-slate-200/80">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <div className="space-y-2">
                  <Input
                    label="Password"
                    type={passwordType}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    icon={(
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? "🙈" : "👁"}
                      </button>
                    )}
                  />
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                    <span>Beni hatırla</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={adminMode} onChange={(e) => setAdminMode(e.target.checked)} />
                    <span>Platform admin olarak giriş yap</span>
                  </label>
                </div>
                {error ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
                <Button type="submit" loading={loading} full>
                  Giriş yap
                </Button>
              </form>
            </Card>

            <div className="mt-4 text-center text-xs text-slate-500">Demo: manager@example.com / Passw0rd!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
