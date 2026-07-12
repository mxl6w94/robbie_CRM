import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Select, Label, FieldGroup } from "@/components/ui/field";
import { Button, LinkButton } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { addLineItem, deleteLineItem, updateInvoiceStatus } from "@/app/invoices/actions";
import { lineComputations, invoiceTotals, formatCurrency } from "@/lib/invoices/calc";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, clients(id, name), jobs(id, title)")
    .eq("id", id)
    .single();

  if (!invoice) notFound();

  const { data: lineItems } = await supabase
    .from("invoice_line_items")
    .select("*")
    .eq("invoice_id", id)
    .order("sort_order")
    .order("created_at");

  const items = lineItems ?? [];
  const totals = invoiceTotals(
    items.map((i) => ({
      qty: Number(i.qty),
      unit_price: Number(i.unit_price),
      discount_pct: Number(i.discount_pct),
    })),
    Number(invoice.tax_rate)
  );

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Invoice #{invoice.invoice_number}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <StatusBadge status={invoice.status} />
            {invoice.clients && (
              <Link href={`/clients/${invoice.clients.id}`} className="hover:underline">
                {invoice.clients.name}
              </Link>
            )}
            {invoice.jobs && (
              <Link href={`/jobs/${invoice.jobs.id}`} className="hover:underline">
                · {invoice.jobs.title}
              </Link>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <a href={`/api/invoices/${invoice.id}/docx`}>
            <Button type="button" variant="secondary">
              Download .docx
            </Button>
          </a>
          <form action={updateInvoiceStatus.bind(null, invoice.id)}>
            <input
              type="hidden"
              name="status"
              value={invoice.status === "paid" ? "unpaid" : "paid"}
            />
            <Button type="submit" variant={invoice.status === "paid" ? "secondary" : "primary"}>
              Mark as {invoice.status === "paid" ? "Unpaid" : "Paid"}
            </Button>
          </form>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-500">
        Invoice Date: {invoice.invoice_date} {invoice.due_date && `· Due: ${invoice.due_date}`}
      </div>

      <Card className="mb-6">
        <CardTitle>Line Items</CardTitle>
        {items.length > 0 ? (
          <Table>
            <Thead>
              <Th>Date</Th>
              <Th>Description</Th>
              <Th>Action</Th>
              <Th>Qty</Th>
              <Th>Unit Price</Th>
              <Th>Pretax/Gross</Th>
              <Th>Discount</Th>
              <Th>Total</Th>
              <Th />
            </Thead>
            <tbody>
              {items.map((item) => {
                const calc = lineComputations({
                  qty: Number(item.qty),
                  unit_price: Number(item.unit_price),
                  discount_pct: Number(item.discount_pct),
                });
                return (
                  <Tr key={item.id}>
                    <Td>{item.line_date ?? "—"}</Td>
                    <Td>{item.description}</Td>
                    <Td>{item.action ?? "—"}</Td>
                    <Td>{item.qty}</Td>
                    <Td>{formatCurrency(Number(item.unit_price))}</Td>
                    <Td>{formatCurrency(calc.pretaxGross)}</Td>
                    <Td>{item.discount_pct}%</Td>
                    <Td>{formatCurrency(calc.total)}</Td>
                    <Td>
                      <form action={deleteLineItem.bind(null, invoice.id, item.id)}>
                        <Button type="submit" variant="ghost" className="text-red-600">
                          Remove
                        </Button>
                      </form>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <p className="mb-4 text-sm text-gray-500">No line items yet.</p>
        )}

        <form
          action={addLineItem.bind(null, invoice.id)}
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          <FieldGroup>
            <Label htmlFor="line_date">Date</Label>
            <Input id="line_date" name="line_date" type="date" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" required />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="action">Action</Label>
            <Select id="action" name="action" defaultValue="Hours">
              <option value="Hours">Hours</option>
              <option value="Material">Material</option>
              <option value="Other">Other</option>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="qty">Qty</Label>
            <Input id="qty" name="qty" type="number" step="0.01" defaultValue="1" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="unit_price">Unit Price</Label>
            <Input
              id="unit_price"
              name="unit_price"
              type="number"
              step="0.01"
              defaultValue="0"
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="discount_pct">Discount %</Label>
            <Input
              id="discount_pct"
              name="discount_pct"
              type="number"
              step="0.01"
              defaultValue="0"
            />
          </FieldGroup>
          <div className="col-span-full">
            <Button type="submit" variant="secondary">
              Add Line Item
            </Button>
          </div>
        </form>
      </Card>

      <Card className="max-w-sm ml-auto">
        <CardTitle>Totals</CardTitle>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Net Price</dt>
            <dd className="text-gray-900">{formatCurrency(totals.netPrice)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Discount</dt>
            <dd className="text-gray-900">-{formatCurrency(totals.discountTotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Tax ({(Number(invoice.tax_rate) * 100).toFixed(2)}%)</dt>
            <dd className="text-gray-900">{formatCurrency(totals.tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold">
            <dt>Total Price</dt>
            <dd>{formatCurrency(totals.totalPrice)}</dd>
          </div>
          <div className="flex justify-between font-semibold text-emerald-700">
            <dt>Amount Due</dt>
            <dd>{formatCurrency(totals.amountDue)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
