import Link from "next/link";
import { supabase } from "@/lib/supabase/server";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { LinkButton } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, invoice_date, status, clients(name)")
    .order("invoice_number", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Invoices</h1>
        <LinkButton href="/invoices/new">New Invoice</LinkButton>
      </div>

      {invoices.length === 0 ? (
        <p className="text-sm text-gray-500">No invoices yet.</p>
      ) : (
        <Table>
          <Thead>
            <Th>#</Th>
            <Th>Client</Th>
            <Th>Date</Th>
            <Th>Status</Th>
          </Thead>
          <tbody>
            {invoices.map((inv) => (
              <Tr key={inv.id}>
                <Td>
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    #{inv.invoice_number}
                  </Link>
                </Td>
                <Td>{inv.clients?.name ?? "—"}</Td>
                <Td>{inv.invoice_date}</Td>
                <Td>
                  <StatusBadge status={inv.status} />
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
