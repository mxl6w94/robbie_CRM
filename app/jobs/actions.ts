"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase/server";

export async function createJob(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const clientId = String(formData.get("client_id") ?? "");
  const propertyId = String(formData.get("property_id") ?? "") || null;
  const status = String(formData.get("status") ?? "estimate");
  const scopeOfWork = String(formData.get("scope_of_work") ?? "").trim() || null;

  if (!title) throw new Error("Title is required");
  if (!clientId) throw new Error("Client is required");

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      title,
      client_id: clientId,
      property_id: propertyId,
      status,
      scope_of_work: scopeOfWork,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/jobs");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/jobs/${data.id}`);
}

export async function updateJob(jobId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const propertyId = String(formData.get("property_id") ?? "") || null;
  const status = String(formData.get("status") ?? "estimate");
  const scopeOfWork = String(formData.get("scope_of_work") ?? "").trim() || null;

  if (!title) throw new Error("Title is required");

  const { data, error } = await supabase
    .from("jobs")
    .update({
      title,
      property_id: propertyId,
      status,
      scope_of_work: scopeOfWork,
    })
    .eq("id", jobId)
    .select("client_id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  if (data?.client_id) revalidatePath(`/clients/${data.client_id}`);
  redirect(`/jobs/${jobId}`);
}
