import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/session";
import { BedForm } from "@/modules/beds/components/bed-form";
import { bedService } from "@/modules/beds/services/bed.service";

type EditBedPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBedPage({
  params,
}: EditBedPageProps) {
  const { id } = await params;

  const client = await getCurrentClient();

  if (!client) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-bold text-red-700">
          Cliente não encontrado
        </h1>

        <p className="mt-2 text-sm text-red-600">
          Não foi possível identificar o cliente da sessão.
        </p>
      </div>
    );
  }

  const [bed, rooms] = await Promise.all([
    bedService.getById(id, client.id),

    prisma.room.findMany({
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
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">
            Alojamento
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Editar Cama
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Atualize o quarto, o identificador e o estado da cama.
          </p>
        </div>

        <Link
          href="/dashboard/beds"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Voltar
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <BedForm
          rooms={rooms}
          bed={{
            id: bed.id,
            roomId: bed.roomId,
            identifier: bed.identifier,
            active: bed.active,
            occupied: bed.occupied,
          }}
        />
      </div>
    </div>
  );
}