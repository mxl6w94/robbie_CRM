import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/server";
import { updateClient } from "@/app/clients/actions";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Edit Client</h1>
      <Card>
        <form action={updateClient.bind(null, client.id)}>
          <FieldGroup>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required defaultValue={client.name} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={client.phone ?? ""} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={client.email ?? ""} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue={client.status ?? "active"}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </FieldGroup>
          <Button type="submit">Save Changes</Button>
        </form>
      </Card>
    </div>
  );
}
