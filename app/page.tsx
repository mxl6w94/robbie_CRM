import Link from "next/link";
import { supabase } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [{ count: activeJobs }, { count: totalClients }, { count: unpaidInvoices }] =
    await Promise.all([
      supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .not("status", "in", "(completed,invoiced)"),
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("status", "unpaid"),
    ]);

  const stats = [
    { label: "Active Jobs", value: activeJobs ?? 0, href: "/jobs" },
    { label: "Clients", value: totalClients ?? 0, href: "/clients" },
    { label: "Unpaid Invoices", value: unpaidInvoices ?? 0, href: "/invoices" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardTitle>{stat.label}</CardTitle>
              <p className="text-3xl font-semibold text-emerald-700">{stat.value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
