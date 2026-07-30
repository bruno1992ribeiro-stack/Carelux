import Link from "next/link";

import { createBed } from "../actions/create-bed";
import { updateBed } from "../actions/update-bed";

type RoomOption = {
  id: string;
  number: string;
  facility: {
    name: string;
  };
};

type BedData = {
  id: string;
  roomId: string;
  identifier: string;
  active: boolean;
  occupied: boolean;
};

type BedFormProps = {
  rooms: RoomOption[];
  bed?: BedData;
};

export function BedForm({
  rooms,
  bed,
}: BedFormProps) {
  const formAction = bed
    ? updateBed.bind(null, bed.id)
    : createBed;

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label
          htmlFor="roomId"
          className="block text-sm font-medium"
        >
          Quarto
        </label>

        <select
          id="roomId"
          name="roomId"
          required
          defaultValue={bed?.roomId ?? ""}
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value="">
            Selecione um quarto
          </option>

          {rooms.map((room) => (
            <option
              key={room.id}
              value={room.id}
            >
              {room.facility.name} — Quarto{" "}
              {room.number}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="identifier"
          className="block text-sm font-medium"
        >
          Identificador da cama
        </label>

        <input
          id="identifier"
          name="identifier"
          type="text"
          required
          defaultValue={bed?.identifier ?? ""}
          placeholder="Ex.: A, B, 1 ou 2"
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <label className="flex items-center gap-3">
          <input
            name="active"
            type="checkbox"
            defaultChecked={bed?.active ?? true}
            className="h-4 w-4"
          />

          <span>
            Cama ativa
          </span>
        </label>

        <label className="flex items-center gap-3">
          <input
            name="occupied"
            type="checkbox"
            defaultChecked={bed?.occupied ?? false}
            className="h-4 w-4"
          />

          <span>
            Cama ocupada
          </span>
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/dashboard/beds"
          className="rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          {bed
            ? "Atualizar Cama"
            : "Guardar Cama"}
        </button>
      </div>
    </form>
  );
}