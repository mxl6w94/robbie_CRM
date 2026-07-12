import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/server";
import { updateJob } from "@/app/jobs/actions";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Select, Label, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ data: job }, { data: properties }] = await Promise.all([
    supabase.from("jobs").select("*").eq("id", id).single(),
    supabase.from("properties").select("id, address").order("address"),
  ]);

  if (!job) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Edit Job</h1>
      <Card>
        <form action={updateJob.bind(null, job.id)}>
          <FieldGroup>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required defaultValue={job.title} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="property_id">Property</Label>
            <Select id="property_id" name="property_id" defaultValue={job.property_id ?? ""}>
              <option value="">No property / not sure yet</option>
              {properties?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.address}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue={job.status ?? "estimate"}>
              <option value="estimate">Estimate</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="invoiced">Invoiced</option>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="scope_of_work">Scope of Work</Label>
            <Textarea
              id="scope_of_work"
              name="scope_of_work"
              rows={3}
              defaultValue={job.scope_of_work ?? ""}
            />
          </FieldGroup>
          <Button type="submit">Save Changes</Button>
        </form>
      </Card>
    </div>
  );
}
