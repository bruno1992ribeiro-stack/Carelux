import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/session";
import { BedForm } from "@/modules/beds/components/bed-form";

export default async function NewBedPage() {
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

  const rooms = await prisma.room.findMany({
    where: {
      facility: {
        clientId: client.id,
      },
    },

    select: {
      id: true,
      number: true,
      facility: {
        select: {
          name: true,
        },
      },
    },

    orderBy: [
      {
        facility: {
          name: "asc",
        },
      },
      {
        number: "asc",
      },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Nova Cama
          </h1>

          <p className="text-gray-500">
            Adicione uma cama a um quarto.
          </p>
        </div>

        <Link
          href="/dashboard/beds"
          className="rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          Voltar
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow">
        {rooms.length > 0 ? (
          <BedForm rooms={rooms} />
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">
              Ainda não existem quartos disponíveis.
            </p>

            <Link
              href="/dashboard/rooms/new"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Criar Quarto
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}