import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";

const socket = io((import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace("/api", ""), {
  auth: { customer_id: localStorage.getItem("cid") || localStorage.getItem("customerId") },
});

export default function Kitchen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/orders");
      setItems((r.data || []).flatMap((o) => o.items || []));
    } catch (err) {
      toast({ title: "Kitchen", description: "Failed to load", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    socket.on("order:update", load);
    return () => socket.disconnect();
  }, []);

  const updateStatus = async (itemId, status) => {
    try {
      await api.post(`/orders/items/${itemId}/status`, { status });
      load();
      toast({ title: "Updated", description: `Status -> ${status}`, variant: "success" });
    } catch (err) {
      toast({ title: "Error", description: "Could not update", variant: "error" });
    }
  };

  const grouped = useMemo(() => {
    return {
      PREPARING: items.filter((i) => i.status !== "READY"),
      READY: items.filter((i) => i.status === "READY"),
    };
  }, [items]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kitchen</h1>
          <p className="text-sm text-slate-600">Hazırlanan ve hazır siparişler</p>
        </div>
        <Button variant="secondary" onClick={load}>Refresh</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TicketColumn title="Preparing" items={grouped.PREPARING} loading={loading} onStatus={updateStatus} actionLabel="Mark Ready" target="READY" />
        <TicketColumn title="Ready" items={grouped.READY} loading={loading} onStatus={updateStatus} actionLabel="Mark Served" target="SERVED" />
      </div>
    </div>
  );
}

function TicketColumn({ title, items, loading, onStatus, actionLabel, target }) {
  return (
    <Card title={title} className="h-[80vh]">
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-slate-500">No tickets</div>
      ) : (
        <div className="grid gap-3">
          {items.map((i) => (
            <div key={i.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{i.table_name || "Takeaway"}</p>
                  <p className="text-xs text-slate-500">{i.product_name}</p>
                </div>
                <Badge color={i.status === "READY" ? "green" : "yellow"}>{i.status}</Badge>
              </div>
              <div className="mt-2 text-xs text-slate-600">Item ID: {i.id}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => onStatus(i.id, target)}>{actionLabel}</Button>
                {target !== "IN_PROGRESS" ? <Button size="sm" variant="secondary" onClick={() => onStatus(i.id, "IN_PROGRESS")}>Start</Button> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
