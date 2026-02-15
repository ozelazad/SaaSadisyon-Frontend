import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Table from "../components/ui/Table.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";

export default function Dashboard() {
  const [data, setData] = useState({ revenue: 0, openTables: 0, activeOrders: 0, topProducts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/reports/today");
        setData(res.data || { revenue: 0, openTables: 0, activeOrders: 0, topProducts: [] });
      } catch (err) {
        setError("Cannot load dashboard");
        toast({ title: "Dashboard", description: "Failed to load", variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const cards = [
    { title: "Today Revenue", value: data.revenue ? `$${data.revenue.toFixed(2)}` : "$0.00" },
    { title: "Open Tables", value: data.openTables },
    { title: "Active Orders", value: data.activeOrders },
  ];

  const showTailwindTest = false; // Set true temporarily to verify Tailwind application

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">Günün performansına hızlı bakış</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/pos")}>Go to POS</Button>
        </div>
      </div>

      {showTailwindTest ? (
        <div className="rounded-xl bg-black text-white p-4 text-sm font-semibold">Tailwind smoke test</div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title} className="shadow-sm">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">{card.title}</p>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card title="Top Products" className="shadow-sm">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <Table
            columns={[
              { accessor: "product_name", header: "Product" },
              { accessor: "quantity", header: "Qty", cell: (row) => row._sum?.quantity || row.quantity || 0 },
            ]}
            data={data.topProducts || []}
            empty="No product stats yet"
          />
        )}
      </Card>
    </div>
  );
}
