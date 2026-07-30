import { getCurrentFacility } from "@/lib/facility";

export async function getResidentFilter() {
  const facility = await getCurrentFacility();

  //
  // Administrador vê tudo
  //
  if (!facility) {
    return {};
  }

  return {
    facilityId: facility.id,
  };
}