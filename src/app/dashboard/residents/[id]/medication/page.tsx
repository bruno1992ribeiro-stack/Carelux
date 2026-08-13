import { ResidentMedications } from "@/modules/resident-medications/components/resident-medications";
import { getResidentMedications } from "@/modules/resident-medications/server/get-resident-medications";

type ResidentMedicationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ResidentMedicationPage({
  params,
}: ResidentMedicationPageProps) {
  const { id } = await params;
  const data = await getResidentMedications(id);

  return (
    <ResidentMedications
      residentId={data.residentId}
      medications={data.medications}
      canEdit={data.authorization.canEdit}
    />
  );
}
