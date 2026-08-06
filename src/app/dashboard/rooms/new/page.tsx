import Link from "next/link";
import { FacilityStatus } from "@prisma/client";

import { getCurrentClient } from "@/lib/session";
import { prisma } from "@/lib/prisma";

import { RoomForm } from "@/modules/rooms/components/room-form";

export default async function NewRoomPage() {
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

  const facilities = await prisma.facility.findMany({
    where: {
      clientId: client.id,
      status: FacilityStatus.ACTIVE,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Novo Quarto
          </h1>

          <p className="text-gray-500">
            Criar um novo quarto e associá-lo a uma unidade.
          </p>
        </div>

        <Link
          href="/dashboard/rooms"
          className="rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          Voltar
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow">
        {facilities.length > 0 ? (
          <RoomForm mode="create" facilities={facilities} />
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">
              Ainda não existem unidades disponíveis.
            </p>

            <Link
              href="/dashboard/facilities/new"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Criar Unidade
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
