import Card from "../components/ui/Card.jsx";

export default function Admin() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
      <Card>
        <p className="text-sm text-slate-600">Platform admin area. Configure tenants, billing, and roles.</p>
      </Card>
    </div>
  );
}
