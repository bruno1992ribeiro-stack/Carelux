import { ResidentSummary } from "@/components/dashboard/residents/resident-summary";
import {
  getResidentSummaryDetails,
  getResidentWorkspace,
} from "@/modules/residents/server/get-resident-workspace";

export default async function ResidentSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [resident, details] = await Promise.all([
    getResidentWorkspace(id),
    getResidentSummaryDetails(id),
  ]);

  return <ResidentSummary details={details} resident={resident} />;
}
