import { requireClient, requireFacility } from "./guards";

export async function clientFilter() {
  const client = await requireClient();

  return {
    clientId: client.id,
  };
}

export async function facilityFilter() {
  const facility = await requireFacility();

  return {
    facilityId: facility.id,
  };
}
