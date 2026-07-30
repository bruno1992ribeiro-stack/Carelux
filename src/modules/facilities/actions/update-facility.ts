"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentClient } from "@/lib/session";

import { facilityService } from "../services/facility.service";

export async function updateFacility(
  id: string,
  formData: FormData
) {
  const client = await getCurrentClient();

  if (!client) {
    throw new Error("Cliente não encontrado.");
  }

  await facilityService.update(id, client.id, {
    name: String(formData.get("name") ?? ""),
    address: String(formData.get("address") ?? ""),
    city: String(formData.get("city") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email:
      String(formData.get("email") ?? "") || undefined,
  });

  revalidatePath("/dashboard/facilities");

  redirect("/dashboard/facilities");
}