import { createRoom } from "../actions/create-room";
import { updateRoom } from "../actions/update-room";

type FacilityOption = {
  id: string;
  name: string;
};

type RoomFormProps = {
  facilities: FacilityOption[];
  room?: {
    id: string;
    facilityId: string;
    number: string;
    floor: string | null;
    capacity: number;
    description: string | null;
  };
};

export function RoomForm({
  facilities,
  room,
}: RoomFormProps) {
  return (
    <form
      action={
        room
          ? updateRoom.bind(null, room.id)
          : createRoom
      }
      className="space-y-6"
    >
      <div className="grid gap-5 md:grid-cols-2">

        <div className="md:col-span-2">
          <label
            htmlFor="facilityId"
            className="block text-sm font-medium mb-1"
          >
            Lar
          </label>

          <select
            id="facilityId"
            name="facilityId"
            required
            defaultValue={room?.facilityId ?? ""}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">
              Selecione um lar
            </option>

            {facilities.map((facility) => (
              <option
                key={facility.id}
                value={facility.id}
              >
                {facility.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="number"
            className="block text-sm font-medium mb-1"
          >
            Número do quarto
          </label>

          <input
            id="number"
            name="number"
            required
            defaultValue={room?.number ?? ""}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="floor"
            className="block text-sm font-medium mb-1"
          >
            Piso
          </label>

          <input
            id="floor"
            name="floor"
            defaultValue={room?.floor ?? ""}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="capacity"
            className="block text-sm font-medium mb-1"
          >
            Capacidade
          </label>

          <input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={room?.capacity ?? 1}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Observações
          </label>

          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={room?.description ?? ""}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          {room ? "Atualizar Quarto" : "Guardar Quarto"}
        </button>
      </div>
    </form>
  );
}