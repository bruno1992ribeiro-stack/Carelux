import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentClient } from "@/lib/session";
import { facilityService } from "@/modules/facilities/services/facility.service";
import { FacilityForm } from "@/modules/facilities/components/facility-form";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditFacilityPage({
  params,
}: Props) {
  const { id } = await params;

  const client = await getCurrentClient();

  if (!client) {
    notFound();
  }

  const facility = await facilityService.getById(
    id,
    client.id
  );

  console.log("FACILITY EDIT:", facility);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Editar Lar
          </h1>

          <p className="text-gray-500">
            {facility.name}
          </p>
        </div>

        <Link
          href="/dashboard/facilities"
          className="rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          Voltar
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow">
        <FacilityForm facility={facility} />
      </div>
    </div>
  );
}