import { getCurrentClient } from "@/lib/session";

export async function getClientFilter() {
  const client = await getCurrentClient();

  if (!client) {
    throw new Error("Cliente não encontrado.");
  }

  return {
    clientId: client.id,
  };
}