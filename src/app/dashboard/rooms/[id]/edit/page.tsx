import Link from "next/link";
import { notFound } from "next/navigation";
import { FacilityStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentClient } from "@/lib/session";

import { RoomForm } from "@/modules/rooms/components/room-form";
import { roomService } from "@/modules/rooms/services/room.service";

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await getCurrentClient();

  if (!client) {
    notFound();
  }

  const room = await roomService.getById(
    id,
    client.id
  );

  const facilities = await prisma.facility.findMany({
    where: {
      clientId: client.id,
      OR: [
        { status: FacilityStatus.ACTIVE },
        { id: room.facilityId },
      ],
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
            Editar Quarto
          </h1>

          <p className="text-gray-500">
            {room.number}
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

        <RoomForm
          mode="edit"
          facilities={facilities}
          room={{
            id: room.id,
            facilityId: room.facilityId,
            number: room.number,
            floor: room.floor,
            capacity: room.capacity,
            description: room.description,
          }}
        />

      </div>

    </div>
  );
}
