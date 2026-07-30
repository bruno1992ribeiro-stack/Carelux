"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentClient } from "@/lib/session";
import { roomService } from "../services/room.service";

export async function createRoom(formData: FormData) {
  const client = await getCurrentClient();

  if (!client) {
    throw new Error("Cliente não encontrado.");
  }

  await roomService.create(client.id, {
    facilityId: String(formData.get("facilityId") ?? ""),
    number: String(formData.get("number") ?? ""),
    floor: String(formData.get("floor") ?? "") || undefined,
    capacity: Number(formData.get("capacity") ?? 1),
    description:
      String(formData.get("description") ?? "") || undefined,
  });

  revalidatePath("/dashboard/rooms");

  redirect("/dashboard/rooms");
}