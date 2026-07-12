import { supabase } from "@/lib/supabase/server";
import { createJob } from "@/app/jobs/actions";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Select, Label, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>;
}) {
  const { client_id: preselectedClientId } = await searchParams;

  const [{ data: clients }, { data: properties }] = await Promise.all([
    supabase.from("clients").select("id, name").order("name"),
    supabase
      .from("properties")
      .select("id, address, client_id, clients(name)")
      .order("address"),
  ]);

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">New Job</h1>
      <Card>
        <form action={createJob}>
          <FieldGroup>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </FieldGroup>
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
            <Label htmlFor="property_id">Property</Label>
            <Select id="property_id" name="property_id" defaultValue="">
              <option value="">No property / not sure yet</option>
              {properties?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.clients?.name ?? "Unknown"} — {p.address}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue="estimate">
              <option value="estimate">Estimate</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="invoiced">Invoiced</option>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="scope_of_work">Scope of Work</Label>
            <Textarea id="scope_of_work" name="scope_of_work" rows={3} />
          </FieldGroup>
          <Button type="submit">Create Job</Button>
        </form>
      </Card>
    </div>
  );
}
