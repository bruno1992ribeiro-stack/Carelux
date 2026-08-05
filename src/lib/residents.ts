import type { Prisma } from "@prisma/client";

import { getCurrentClientUser } from "@/lib/session";

export async function getResidentFilter(): Promise<Prisma.ResidentWhereInput> {
  const user = await getCurrentClientUser();

  if (!user) {
    throw new Error("Utilizador não encontrado.");
  }

  /*
   * Um utilizador associado a um lar vê apenas
   * os utentes desse lar.
   */
  if (user.facilityId) {
    return {
      facilityId: user.facilityId,
      facility: {
        clientId: user.clientId,
      },
    };
  }

  /*
   * Um administrador sem lar associado vê todos
   * os utentes do seu cliente, mas nunca de outros clientes.
   */
  return {
    facility: {
      clientId: user.clientId,
    },
  };
}
