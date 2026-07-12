import Link from "next/link";
import { supabase } from "@/lib/supabase/server";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { LinkButton } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, name, phone, email, status")
    .order("name");

  if (error) throw new Error(error.message);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
        <LinkButton href="/clients/new">New Client</LinkButton>
      </div>

      {clients.length === 0 ? (
        <p className="text-sm text-gray-500">No clients yet.</p>
      ) : (
        <Table>
          <Thead>
            <Th>Name</Th>
            <Th>Phone</Th>
            <Th>Email</Th>
            <Th>Status</Th>
          </Thead>
          <tbody>
            {clients.map((client) => (
              <Tr key={client.id}>
                <Td>
                  <Link
                    href={`/clients/${client.id}`}
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    {client.name}
                  </Link>
                </Td>
                <Td>{client.phone ?? "—"}</Td>
                <Td>{client.email ?? "—"}</Td>
                <Td>
                  <StatusBadge status={client.status} />
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
