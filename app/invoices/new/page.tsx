import { supabase } from "@/lib/supabase/server";
import { createInvoice } from "@/app/invoices/actions";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Select, Label, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string; job_id?: string }>;
}) {
  const { client_id: preselectedClientId, job_id: preselectedJobId } =
    await searchParams;

  const [{ data: clients }, { data: jobs }] = await Promise.all([
    supabase.from("clients").select("id, name").order("name"),
    supabase.from("jobs").select("id, title, client_id").order("title"),
  ]);

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">New Invoice</h1>
      <Card>
        <form action={createInvoice}>
          <FieldGroup>
            <Label htmlFor="client_id">Client</Label>
            <Select
              id="client_id"
              name="client_id"
              required
              defaultValue={preselectedClientId ?? ""}
            >
              <option value="" disabled>
                Select a client
              </option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="job_id">Job (optional)</Label>
            <Select id="job_id" name="job_id" defaultValue={preselectedJobId ?? ""}>
              <option value="">No linked job</option>
              {jobs?.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="invoice_date">Invoice Date</Label>
            <Input
              id="invoice_date"
              name="invoice_date"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="due_date">Due Date</Label>
            <Input id="due_date" name="due_date" type="date" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="tax_rate">Tax Rate</Label>
            <Input
              id="tax_rate"
              name="tax_rate"
              type="number"
              step="0.0001"
              min="0"
              max="1"
              defaultValue="0.07"
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              rows={2}
              defaultValue="Thank you for working with us!"
            />
          </FieldGroup>
          <Button type="submit">Create Invoice</Button>
        </form>
      </Card>
    </div>
  );
}
