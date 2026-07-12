import { createClient } from "@/app/clients/actions";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export default function NewClientPage() {
  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">New Client</h1>
      <Card>
        <form action={createClient}>
          <FieldGroup>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue="active">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </FieldGroup>
          <Button type="submit">Create Client</Button>
        </form>
      </Card>
    </div>
  );
}
