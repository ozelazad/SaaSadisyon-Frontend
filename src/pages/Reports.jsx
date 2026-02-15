import { useEffect, useState } from "react";
import api from "../services/api.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Table from "../components/ui/Table.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";

export default function Reports() {
  const [data, setData] = useState({ revenue: 0, openTables: 0, activeOrders: 0, topProducts: [] });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/today");
      setData(res.data || { revenue: 0, openTables: 0, activeOrders: 0, topProducts: [] });
    } catch (err) {
      toast({ title: "Reports", description: "Failed to load", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const exportCsv = () => {
    const rows = [
      ["Today revenue", data.revenue],
      ["Open tables", data.openTables],
      ["Active orders", data.activeOrders],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "CSV downloaded", variant: "success" });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-600">Özet ve hızlı ihracat</p>
        </div>
        <Button onClick={exportCsv}>Export CSV</Button>
      </div>

      <Card title="Filters">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <Input label="From" type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} />
          <Input label="To" type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} />
          <div className="flex items-end">
            <Button variant="secondary" onClick={load}>Refresh</Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-amber-600">Note: Backend exposes only /reports/today; date filters are cosmetic.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          {loading ? <Skeleton className="h-6 w-20" /> : <div className="space-y-1"><p className="text-xs text-slate-500">Revenue</p><p className="text-2xl font-bold">${data.revenue?.toFixed ? data.revenue.toFixed(2) : data.revenue}</p></div>}
        </Card>
        <Card>
          {loading ? <Skeleton className="h-6 w-20" /> : <div className="space-y-1"><p className="text-xs text-slate-500">Open Tables</p><p className="text-2xl font-bold">{data.openTables}</p></div>}
        </Card>
        <Card>
          {loading ? <Skeleton className="h-6 w-20" /> : <div className="space-y-1"><p className="text-xs text-slate-500">Active Orders</p><p className="text-2xl font-bold">{data.activeOrders}</p></div>}
        </Card>
      </div>

      <Card title="Top products">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : (
          <Table
            columns={[
              { accessor: "product_name", header: "Product" },
              { accessor: "quantity", header: "Qty", cell: (r) => r._sum?.quantity || 0 },
            ]}
            data={data.topProducts || []}
            empty="No data"
          />
        )}
      </Card>
    </div>
  );
}
