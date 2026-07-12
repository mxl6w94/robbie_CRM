import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Textarea, Label, FieldGroup } from "@/components/ui/field";
import { Button, LinkButton } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { addProperty, addActivityNote } from "@/app/clients/actions";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ data: client }, { data: properties }, { data: jobs }, { data: notes }, { data: invoices }] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", id).single(),
      supabase
        .from("properties")
        .select("id, address, site_instructions")
        .eq("client_id", id)
        .order("created_at"),
      supabase
        .from("jobs")
        .select("id, title, status")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("activity_logs")
        .select("id, content, author, created_at")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("invoices")
        .select("id, invoice_number, status, invoice_date")
        .eq("client_id", id)
        .order("invoice_number", { ascending: false }),
    ]);

  if (!client) notFound();

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{client.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <StatusBadge status={client.status} />
            {client.phone && <span>{client.phone}</span>}
            {client.email && <span>{client.email}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/invoices/new?client_id=${client.id}`} variant="primary">
            New Invoice
          </LinkButton>
          <LinkButton href={`/clients/${client.id}/edit`} variant="secondary">
            Edit
          </LinkButton>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardTitle>Properties</CardTitle>
          <ul className="mb-4 space-y-2">
            {properties && properties.length > 0 ? (
              properties.map((p) => (
                <li key={p.id} className="text-sm text-gray-700">
                  <div className="font-medium">{p.address}</div>
                  {p.site_instructions && (
                    <div className="text-gray-500">{p.site_instructions}</div>
                  )}
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500">No properties yet.</li>
            )}
          </ul>
          <form action={addProperty.bind(null, client.id)} className="space-y-2">
            <FieldGroup>
              <Label htmlFor="address">Add Property — Address</Label>
              <Input id="address" name="address" required />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="site_instructions">Site Instructions</Label>
              <Textarea id="site_instructions" name="site_instructions" rows={2} />
            </FieldGroup>
            <Button type="submit" variant="secondary">
              Add Property
            </Button>
          </form>
        </Card>

        <Card>
          <CardTitle>Jobs</CardTitle>
          <ul className="mb-4 space-y-2">
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <li key={job.id} className="flex items-center justify-between text-sm">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    {job.title}
                  </Link>
                  <StatusBadge status={job.status} />
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500">No jobs yet.</li>
            )}
          </ul>
          <LinkButton href={`/jobs/new?client_id=${client.id}`} variant="secondary">
            New Job
          </LinkButton>
        </Card>

        <Card>
          <CardTitle>Invoices</CardTitle>
          <ul className="space-y-2">
            {invoices && invoices.length > 0 ? (
              invoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between text-sm">
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    #{inv.invoice_number}
                  </Link>
                  <StatusBadge status={inv.status} />
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500">No invoices yet.</li>
            )}
          </ul>
        </Card>

        <Card>
          <CardTitle>Activity Log</CardTitle>
          <ul className="mb-4 space-y-3">
            {notes && notes.length > 0 ? (
              notes.map((note) => (
                <li key={note.id} className="text-sm text-gray-700">
                  <div>{note.content}</div>
                  <div className="text-xs text-gray-400">
                    {note.author ? `${note.author} — ` : ""}
                    {new Date(note.created_at!).toLocaleString()}
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500">No notes yet.</li>
            )}
          </ul>
          <form
            action={addActivityNote.bind(null, client.id, null)}
            className="space-y-2"
          >
            <FieldGroup>
              <Label htmlFor="content">Add Note</Label>
              <Textarea id="content" name="content" rows={2} required />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="author">Author</Label>
              <Input id="author" name="author" />
            </FieldGroup>
            <Button type="submit" variant="secondary">
              Add Note
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
