import { prisma } from "@/lib/prisma";
import { getCurrentClientUser } from "@/lib/session";

export async function getCurrentFacility() {
  const user = await getCurrentClientUser();

  if (!user) {
    throw new Error("Utilizador não autenticado.");
  }

  //
  // Administrador global
  //
  if (!user.facilityId) {
    return null;
  }

  const facility = await prisma.facility.findFirst({
    where: {
      id: user.facilityId,
      clientId: user.clientId,
    },
  });

  if (!facility) {
    throw new Error("Unidade inválida.");
  }

  return facility;
}
