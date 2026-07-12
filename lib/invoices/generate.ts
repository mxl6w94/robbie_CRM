import "server-only";
import fs from "fs";
import path from "path";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { supabase } from "@/lib/supabase/server";
import { lineComputations, invoiceTotals } from "./calc";

function formatPlain(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatLongDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function splitAddress(address: string | null) {
  if (!address) return { line1: "", line2: "" };
  const idx = address.indexOf(",");
  if (idx === -1) return { line1: address.trim(), line2: "" };
  return { line1: address.slice(0, idx).trim(), line2: address.slice(idx + 1).trim() };
}

export async function generateInvoiceDocx(invoiceId: string) {
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, clients(name), jobs(properties(address))")
    .eq("id", invoiceId)
    .single();

  if (error || !invoice) throw new Error(error?.message ?? "Invoice not found");

  const { data: lineItems, error: lineError } = await supabase
    .from("invoice_line_items")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("sort_order")
    .order("created_at");

  if (lineError) throw new Error(lineError.message);

  const items = lineItems ?? [];
  const totals = invoiceTotals(
    items.map((i) => ({
      qty: Number(i.qty),
      unit_price: Number(i.unit_price),
      discount_pct: Number(i.discount_pct),
    })),
    Number(invoice.tax_rate)
  );

  const { line1, line2 } = splitAddress(invoice.jobs?.properties?.address ?? null);

  const templatePath = path.join(process.cwd(), "templates", "invoice-template.docx");
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  doc.render({
    client_name: invoice.clients?.name ?? "",
    address_line1: line1,
    address_line2: line2,
    invoice_number: invoice.invoice_number,
    invoice_date: formatLongDate(invoice.invoice_date),
    due_date: formatLongDate(invoice.due_date),
    message: invoice.message ?? "",
    items: items.map((item) => {
      const calc = lineComputations({
        qty: Number(item.qty),
        unit_price: Number(item.unit_price),
        discount_pct: Number(item.discount_pct),
      });
      return {
        line_date: formatShortDate(item.line_date),
        description: item.description,
        action: item.action ?? "",
        qty: Number(item.qty).toString(),
        unit_price: formatPlain(Number(item.unit_price)),
        pretax_gross: formatPlain(calc.pretaxGross),
        discount_pct: Number(item.discount_pct).toFixed(2),
        total: formatPlain(calc.total),
      };
    }),
    net_price: formatPlain(totals.netPrice),
    discount_total: formatPlain(totals.discountTotal),
    tax: formatPlain(totals.tax),
    total_price: formatPlain(totals.totalPrice),
    amount_due: formatPlain(totals.amountDue),
  });

  const buffer = doc.getZip().generate({ type: "nodebuffer" }) as Buffer;
  const filename = `invoice-${invoice.invoice_number}.docx`;

  return { buffer, filename };
}
