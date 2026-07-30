"use server";

import { revalidatePath } from "next/cache";

import { getCurrentClient } from "@/lib/session";
import { roomService } from "../services/room.service";

export async function deleteRoom(id: string) {
  const client = await getCurrentClient();

  if (!client) {
    throw new Error("Cliente não encontrado.");
  }

  await roomService.delete(id, client.id);

  revalidatePath("/dashboard/rooms");
}