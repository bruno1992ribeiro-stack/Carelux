import { ResidentAppointments } from "@/modules/resident-appointments/components/resident-appointments";
import { getResidentAppointments } from "@/modules/resident-appointments/server/get-resident-appointments";

type ResidentAppointmentsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ResidentAppointmentsPage({
  params,
}: ResidentAppointmentsPageProps) {
  const { id } = await params;
  const data = await getResidentAppointments(id);

  return <ResidentAppointments residentId={id} {...data} />;
}
