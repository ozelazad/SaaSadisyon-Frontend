import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import SearchInput from "../components/ui/SearchInput.jsx";
import Badge from "../components/ui/Badge.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";

const socket = io((import.meta.env.VITE_API_URL || "https://saasadisyon-backend.onrender.com/api").replace("/api", ""), {
  auth: { customer_id: localStorage.getItem("cid") || localStorage.getItem("customerId") },
});

export default function POS() {
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [tableSearch, setTableSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [tablesRes, productsRes, ordersRes] = await Promise.all([
        api.get("/tables"),
        api.get("/products"),
        api.get("/orders"),
      ]);
      setTables(tablesRes.data || []);
      setMenu(productsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      toast({ title: "POS", description: "Data load failed", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    socket.on("order:update", loadData);
    socket.on("order:new", loadData);
    return () => socket.disconnect();
  }, [toast]);

  const filteredTables = useMemo(() => {
    return tables.filter((t) => t.name?.toLowerCase().includes(tableSearch.toLowerCase()));
  }, [tables, tableSearch]);

  const categories = useMemo(() => {
    const setCat = new Set(["All"]);
    menu.forEach((p) => setCat.add(p.category || "Uncategorized"));
    return Array.from(setCat);
  }, [menu]);
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredMenu = useMemo(() => {
    return menu.filter((p) => {
      const matchesSearch = p.name?.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = activeCategory === "All" || (p.category || "Uncategorized") === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menu, productSearch, activeCategory]);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    return { subtotal, total: subtotal };
  }, [cart]);

  const addToCart = (p) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === p.id);
      if (existing) {
        return prev.map((item) => item.product_id === p.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product_id: p.id, qty: 1, name: p.name, price: p.price, note: "" }];
    });
    toast({ title: "Added", description: p.name, variant: "success" });
  };

  const changeQty = (id, delta) => {
    setCart((prev) => prev
      .map((item) => item.product_id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item)
      .filter((item) => item.qty > 0));
  };

  const removeItem = (id) => setCart((prev) => prev.filter((item) => item.product_id !== id));

  const placeOrder = async () => {
    if (!selectedTable || !cart.length) return;
    setSending(true);
    try {
      const items = cart.map((c) => ({ product_id: c.product_id, quantity: c.qty, note: c.note }));
      const order = await api.post("/orders", { table_id: selectedTable, items });
      await api.post(`/orders/${order.data.id}/payments`, { amount: 0, type: "CASH" });
      socket.emit("order:update", { order_id: order.data.id });
      setCart([]);
      toast({ title: "Order created", description: "Table order kaydedildi", variant: "success" });
      loadData();
    } catch (err) {
      toast({ title: "Failed", description: "Order oluşturulamadı", variant: "error" });
    } finally {
      setSending(false);
    }
  };

  const notImplemented = (label) => toast({ title: label, description: "Not available in API", variant: "error" });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">POS</h1>
          <p className="text-sm text-slate-600">Masaları, menüyü ve siparişleri yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setSelectedTable(null)}>Masayı temizle</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr_1fr]">
        <Card
          title="Masalar"
          action={<SearchInput placeholder="Masalarda ara" value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} />}
          className="h-[80vh]"
        >
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="text-sm text-slate-500">No tables</div>
          ) : (
            <div className="grid gap-2">
              {filteredTables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTable(t.id)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left transition ${
                    selectedTable === t.id ? "border-brand-300 bg-brand-50 shadow-sm" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-500">Status: {t.status}</div>
                  </div>
                  <Badge color={t.status === "OPEN" ? "yellow" : "green"}>{t.status}</Badge>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Menü"
          action={
            <div className="flex items-center gap-2">
              <SearchInput placeholder="Ürün ara" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
            </div>
          }
          className="h-[80vh] overflow-hidden"
        >
          <div className="mb-3 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition ${
                  activeCategory === cat ? "bg-brand-100 text-brand-700 ring-1 ring-brand-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-20" />
              ))}
            </div>
          ) : filteredMenu.length === 0 ? (
            <div className="text-sm text-slate-500">No products</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {filteredMenu.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
                >
                  <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.category || "Uncategorized"}</div>
                  <div className="mt-2 text-base font-bold text-slate-900">${p.price?.toFixed ? p.price.toFixed(2) : p.price}</div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card title="Sipariş" className="h-[80vh]">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2">
              <div>
                <p className="text-xs text-slate-500">Selected table</p>
                <p className="text-sm font-semibold text-slate-900">{selectedTable ? tables.find((t) => t.id === selectedTable)?.name || selectedTable : "None"}</p>
              </div>
              <Badge color={selectedTable ? "blue" : "slate"}>{selectedTable ? "Active" : "Pick a table"}</Badge>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-2">
              {cart.length === 0 ? (
                <div className="text-sm text-slate-500">No items yet</div>
              ) : (
                cart.map((item) => (
                  <div key={item.product_id} className="rounded-lg border border-slate-100 bg-white px-3 py-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">${item.price} • Subtotal ${(item.price * item.qty).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => changeQty(item.product_id, -1)} className="h-8 w-8 rounded-full border text-sm">-</button>
                        <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                        <button onClick={() => changeQty(item.product_id, 1)} className="h-8 w-8 rounded-full border text-sm">+</button>
                        <button onClick={() => removeItem(item.product_id)} className="text-slate-400 hover:text-red-500">✕</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="flex items-center justify-between"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
              <div className="flex items-center justify-between font-semibold"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" disabled={!cart.length} onClick={() => notImplemented("Split bill")}>Split Bill</Button>
              <Button variant="secondary" disabled={!cart.length} onClick={() => notImplemented("Take payment")}>Take Payment</Button>
              <Button variant="secondary" disabled={!cart.length} onClick={() => notImplemented("Close order")}>Close Order</Button>
              <Button disabled={!cart.length || !selectedTable} loading={sending} onClick={placeOrder}>Create Order</Button>
            </div>

            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Aktif siparişler</p>
                <Badge color="blue">{orders.length}</Badge>
              </div>
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {orders.length === 0 ? (
                  <p className="text-xs text-slate-500">Henüz sipariş yok</p>
                ) : (
                  orders.map((o) => (
                    <div key={o.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{tables.find((t) => t.id === o.table_id)?.name || "Masa"}</span>
                        <Badge color={o.status === "CLOSED" ? "green" : "yellow"}>{o.status}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{o.items?.length || 0} ürün</span>
                        <span>₺{o.total_amount || 0}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
