import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import SearchInput from "../components/ui/SearchInput.jsx";
import Table from "../components/ui/Table.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/tables");
        setTables(res.data || []);
      } catch (err) {
        toast({ title: "Tables", description: "Load failed", variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const filtered = useMemo(() => tables.filter((t) => t.name?.toLowerCase().includes(search.toLowerCase())), [tables, search]);

  const notImplemented = () => toast({ title: "Not available", description: "Create/Rename endpoints missing", variant: "error" });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tables</h1>
          <p className="text-sm text-slate-600">Masa listesini görüntüleyin</p>
        </div>
        <Button onClick={notImplemented}>Create Table</Button>
      </div>

      <Card title="All Tables" action={<SearchInput placeholder="Search tables" value={search} onChange={(e) => setSearch(e.target.value)} />}>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <Table
            columns={[
              { accessor: "name", header: "Table" },
              { accessor: "status", header: "Status" },
            ]}
            data={filtered}
            empty="No tables"
          />
        )}
      </Card>
    </div>
  );
}
