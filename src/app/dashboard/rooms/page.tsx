import Link from "next/link";

import { getCurrentClient } from "@/lib/session";
import { roomService } from "@/modules/rooms/services/room.service";
import { deleteRoom } from "@/modules/rooms/actions/delete-room";

export default async function RoomsPage() {
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

  const rooms = await roomService.findAll(client.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Quartos
          </h1>

          <p className="text-gray-500">
            Gestão dos quartos pertencentes aos seus lares.
          </p>
        </div>

        <Link
          href="/dashboard/rooms/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Novo Quarto
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow">
        <table className="w-full">
          <thead className="border-b bg-gray-100">
            <tr>
              <th className="p-3 text-left">
                Lar
              </th>

              <th className="p-3 text-left">
                Quarto
              </th>

              <th className="p-3 text-left">
                Piso
              </th>

              <th className="p-3 text-left">
                Capacidade
              </th>

              <th className="p-3 text-right">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {rooms.map((room) => (
              <tr
                key={room.id}
                className="border-b"
              >
                <td className="p-3">
                  {room.facility.name}
                </td>

                <td className="p-3 font-medium">
                  {room.number}
                </td>

                <td className="p-3">
                  {room.floor || "-"}
                </td>

                <td className="p-3">
                  {room.capacity}
                </td>

                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/dashboard/rooms/${room.id}/edit`}
                      className="rounded border px-3 py-1 hover:bg-gray-100"
                    >
                      Editar
                    </Link>

                    <form
                      action={deleteRoom.bind(null, room.id)}
                    >
                      <button
                        type="submit"
                        className="rounded border border-red-500 px-3 py-1 text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}

            {rooms.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-500"
                >
                  Ainda não existem quartos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}