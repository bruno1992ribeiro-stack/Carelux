"use server";

import { facilityService } from "./services/facility.service";
import { getCurrentClient } from "@/lib/session";

export async function getFacilities() {
  const client = await getCurrentClient();

  if (!client) {
    throw new Error("Cliente não encontrado.");
  }

  return facilityService.findAll(client.id);
}
