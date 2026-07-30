import Link from "next/link";

import { getCurrentClient } from "@/lib/session";
import { facilityService } from "@/modules/facilities/services/facility.service";

export default async function FacilitiesPage() {
  const client = await getCurrentClient();

  if (!client) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">
          Cliente não encontrado
        </h1>

        <p className="mt-2 text-gray-500">
          Não foi possível identificar o cliente da sessão.
        </p>
      </div>
    );
  }

  const facilities = await facilityService.findAll(client.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Lares
          </h1>

          <p className="text-gray-500">
            Gestão dos lares pertencentes ao seu cliente.
          </p>
        </div>

        <Link
          href="/dashboard/facilities/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Novo Lar
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow">
        <table className="w-full">
          <thead className="border-b bg-gray-100">
            <tr>
              <th className="p-3 text-left">
                Nome
              </th>

              <th className="p-3 text-left">
                Cidade
              </th>

              <th className="p-3 text-left">
                Telefone
              </th>

              <th className="p-3 text-right">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {facilities.map((facility) => (
              <tr
                key={facility.id}
                className="border-b"
              >
                <td className="p-3 font-medium">
                  {facility.name}
                </td>

                <td className="p-3">
                  {facility.city ?? "-"}
                </td>

                <td className="p-3">
                  {facility.phone ?? "-"}
                </td>

                <td className="p-3">
                  <div className="flex justify-end gap-2">

                    <Link
                      href={`/dashboard/facilities/${facility.id}/edit`}
                      className="rounded border px-3 py-1 hover:bg-gray-100"
                    >
                      Editar
                    </Link>

                    <button
                      type="button"
                      className="rounded border border-red-500 px-3 py-1 text-red-600 hover:bg-red-50"
                    >
                      Eliminar
                    </button>

                  </div>
                </td>
              </tr>
            ))}

            {facilities.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-8 text-center text-gray-500"
                >
                  Ainda não existem lares registados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}