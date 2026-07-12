"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase/server";

export async function createClient(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "active");

  if (!name) throw new Error("Name is required");

  const { data, error } = await supabase
    .from("clients")
    .insert({ name, phone, email, status })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/clients");
  redirect(`/clients/${data.id}`);
}

export async function updateClient(clientId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "active");

  if (!name) throw new Error("Name is required");

  const { error } = await supabase
    .from("clients")
    .update({ name, phone, email, status })
    .eq("id", clientId);

  if (error) throw new Error(error.message);

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

export async function addProperty(clientId: string, formData: FormData) {
  const address = String(formData.get("address") ?? "").trim();
  const siteInstructions =
    String(formData.get("site_instructions") ?? "").trim() || null;

  if (!address) throw new Error("Address is required");

  const { error } = await supabase.from("properties").insert({
    client_id: clientId,
    address,
    site_instructions: siteInstructions,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/clients/${clientId}`);
}

export async function addActivityNote(
  clientId: string,
  jobId: string | null,
  formData: FormData
) {
  const content = String(formData.get("content") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim() || null;

  if (!content) throw new Error("Note content is required");

  const { error } = await supabase.from("activity_logs").insert({
    client_id: clientId,
    job_id: jobId,
    content,
    author,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/clients/${clientId}`);
  if (jobId) revalidatePath(`/jobs/${jobId}`);
}
