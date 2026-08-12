import { ResidentHealth } from "@/modules/resident-clinical/components/resident-health";
import { getResidentHealth } from "@/modules/resident-clinical/server/get-resident-health";

export default async function ResidentHealthPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const health = await getResidentHealth(id);
  return <ResidentHealth residentId={id} {...health} />;
}
