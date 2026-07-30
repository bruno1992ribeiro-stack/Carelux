export async function tenantFacilityWhere() {
  const client = await getCurrentClient();

  return {
    clientId: client!.id,
  };
}