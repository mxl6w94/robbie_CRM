"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase/server";

export async function createInvoice(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const jobId = String(formData.get("job_id") ?? "") || null;
  const invoiceDate = String(formData.get("invoice_date") ?? "") || undefined;
  const dueDate = String(formData.get("due_date") ?? "") || null;
  const message = String(formData.get("message") ?? "").trim() || null;
  const taxRate = Number(formData.get("tax_rate") ?? 0.07);

  if (!clientId) throw new Error("Client is required");

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      client_id: clientId,
      job_id: jobId,
      invoice_date: invoiceDate,
      due_date: dueDate,
      message,
      tax_rate: taxRate,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/invoices");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/invoices/${data.id}`);
}

export async function updateInvoiceStatus(invoiceId: string, formData: FormData) {
  const status = String(formData.get("status") ?? "unpaid");

  const { data, error } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", invoiceId)
    .select("client_id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  if (data?.client_id) revalidatePath(`/clients/${data.client_id}`);
}

export async function addLineItem(invoiceId: string, formData: FormData) {
  const description = String(formData.get("description") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim() || null;
  const lineDate = String(formData.get("line_date") ?? "") || null;
  const qty = Number(formData.get("qty") ?? 1);
  const unitPrice = Number(formData.get("unit_price") ?? 0);
  const discountPct = Number(formData.get("discount_pct") ?? 0);

  if (!description) throw new Error("Description is required");

  const { error } = await supabase.from("invoice_line_items").insert({
    invoice_id: invoiceId,
    description,
    action,
    line_date: lineDate,
    qty,
    unit_price: unitPrice,
    discount_pct: discountPct,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/invoices/${invoiceId}`);
}

export async function deleteLineItem(invoiceId: string, lineItemId: string) {
  const { error } = await supabase
    .from("invoice_line_items")
    .delete()
    .eq("id", lineItemId);

  if (error) throw new Error(error.message);

  revalidatePath(`/invoices/${invoiceId}`);
}
