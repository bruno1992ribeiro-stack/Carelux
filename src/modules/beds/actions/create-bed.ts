"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getCurrentClient } from "@/lib/session";
import { bedService } from "../services/bed.service";

export async function createBed(formData: FormData) {
  const client = await getCurrentClient();

  if (!client) {
    throw new Error("Cliente não encontrado.");
  }

  await bedService.create(client.id, {
    roomId: String(formData.get("roomId") ?? ""),
    identifier: String(
      formData.get("identifier") ?? ""
    ).trim(),
    active: formData.get("active") === "on",
    occupied: formData.get("occupied") === "on",
  });

  revalidatePath("/dashboard/beds");

  redirect("/dashboard/beds");
}
