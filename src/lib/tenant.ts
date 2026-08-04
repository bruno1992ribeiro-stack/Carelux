import { requireClient } from "./guards";

export async function tenantFacilityWhere() {
  const client = await requireClient();

  return {
    clientId: client.id,
  };
}
