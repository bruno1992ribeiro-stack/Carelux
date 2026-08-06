import Link from "next/link";

import { FacilityForm } from "@/modules/facilities/components/facility-form";

export default function NewFacilityPage() {
  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Nova Unidade
          </h1>

          <p className="text-gray-500">
            Criar uma nova unidade.
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

        <FacilityForm mode="create" />

      </div>

    </div>
  );
}
