"use server";

import { revalidatePath } from "next/cache";

import { getCurrentClient } from "@/lib/session";
import { bedService } from "../services/bed.service";

export async function deleteBed(id: string) {
  const client = await getCurrentClient();

  if (!client) {
    throw new Error("Cliente não encontrado.");
  }

  await bedService.delete(id, client.id);

  revalidatePath("/dashboard/beds");
}