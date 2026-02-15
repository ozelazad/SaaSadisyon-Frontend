import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import SearchInput from "../components/ui/SearchInput.jsx";
import Table from "../components/ui/Table.jsx";
import Modal from "../components/ui/Modal.jsx";
import Input from "../components/ui/Input.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", category: "" });
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/products");
        setProducts(res.data || []);
      } catch (err) {
        toast({ title: "Products", description: "Load failed", variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const filtered = useMemo(() => products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase())), [products, search]);

  const notImplemented = () => toast({ title: "Not available", description: "Create/Edit endpoints missing", variant: "error" });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-600">Ürün listesini görüntüleyin</p>
        </div>
        <Button onClick={() => { setForm({ name: "", price: "", category: "" }); setModalOpen(true); }}>Add Product</Button>
      </div>

      <Card
        title="All Products"
        action={<SearchInput placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />}
      >
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : (
          <Table
            columns={[
              { accessor: "name", header: "Name" },
              { accessor: "category", header: "Category", cell: (r) => r.category || "-" },
              { accessor: "price", header: "Price", cell: (r) => `$${(r.price || 0).toFixed ? r.price.toFixed(2) : r.price}` },
            ]}
            data={filtered}
            empty="No products"
          />
        )}
      </Card>

      <Modal
        open={modalOpen}
        title="Add / Edit Product"
        onClose={() => setModalOpen(false)}
        actions={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={notImplemented}>Save</Button>
          </>
        )}
      >
        <div className="space-y-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input label="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <p className="text-xs text-amber-600">Note: Backend currently only supports listing products. Create/Update is disabled.</p>
        </div>
      </Modal>
    </div>
  );
}
