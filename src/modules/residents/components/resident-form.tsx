"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  createResident,
  updateResident,
  type ActionState,
} from "../actions";

type FacilityOption = {
  id: string;
  name: string;
};

type RoomOption = {
  id: string;
  facilityId: string;
  number: string;
};

type BedOption = {
  id: string;
  roomId: string;
  identifier: string;
  active: boolean;
  occupied: boolean;
};

type ResidentData = {
  id: string;
  facilityId: string;
  roomId: string | null;
  bedId: string | null;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  admissionDate: string;
  status: string;
};

type ResidentFormProps = {
  facilities: FacilityOption[];
  rooms: RoomOption[];
  beds: BedOption[];
  resident?: ResidentData;
  facilityLocked?: boolean;
};

const initialState: ActionState = {
  success: false,
  message: "",
};

const fieldClassName =
  "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null;
  }

  return <p className="mt-1 text-sm text-red-600">{messages[0]}</p>;
}

export function ResidentForm({
  facilities,
  rooms,
  beds,
  resident,
  facilityLocked = false,
}: ResidentFormProps) {
  const action = resident
    ? updateResident.bind(null, resident.id)
    : createResident;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [facilityId, setFacilityId] = useState(
    resident?.facilityId ?? facilities[0]?.id ?? ""
  );
  const [roomId, setRoomId] = useState(resident?.roomId ?? "");
  const [bedId, setBedId] = useState(resident?.bedId ?? "");
  const [status, setStatus] = useState(resident?.status ?? "ACTIVE");

  const locationDisabled = status === "DISCHARGED" || status === "DECEASED";
  const roomDisabled = locationDisabled || !facilityId;
  const bedDisabled = locationDisabled || !roomId;
  const availableRooms = rooms.filter(
    (room) => room.facilityId === facilityId
  );
  const availableBeds = beds.filter(
    (bed) =>
      bed.roomId === roomId &&
      ((bed.active && !bed.occupied) || bed.id === resident?.bedId)
  );

  function handleFacilityChange(value: string) {
    setFacilityId(value);
    setRoomId("");
    setBedId("");
  }

  function handleRoomChange(value: string) {
    setRoomId(value);
    setBedId("");
  }

  function handleStatusChange(value: string) {
    setStatus(value);

    if (value === "DISCHARGED" || value === "DECEASED") {
      setRoomId("");
      setBedId("");
    }
  }

  return (
    <form action={formAction} className="space-y-7">
      {state.message && !state.success && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.message}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Nome
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            defaultValue={resident?.firstName ?? ""}
            className={fieldClassName}
          />
          <FieldError messages={state.errors?.firstName} />
        </div>

        <div>
          <label htmlFor="lastName" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Apelido
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            defaultValue={resident?.lastName ?? ""}
            className={fieldClassName}
          />
          <FieldError messages={state.errors?.lastName} />
        </div>

        <div>
          <label htmlFor="birthDate" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Data de nascimento
          </label>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            defaultValue={resident?.birthDate ?? ""}
            className={fieldClassName}
          />
          <FieldError messages={state.errors?.birthDate} />
        </div>

        <div>
          <label htmlFor="gender" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Género
          </label>
          <select
            id="gender"
            name="gender"
            defaultValue={resident?.gender ?? ""}
            className={fieldClassName}
          >
            <option value="">Não indicado</option>
            <option value="MALE">Masculino</option>
            <option value="FEMALE">Feminino</option>
            <option value="OTHER">Outro</option>
          </select>
          <FieldError messages={state.errors?.gender} />
        </div>

        <div>
          <label htmlFor="admissionDate" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Data de admissão
          </label>
          <input
            id="admissionDate"
            name="admissionDate"
            type="date"
            defaultValue={resident?.admissionDate ?? ""}
            className={fieldClassName}
          />
          <FieldError messages={state.errors?.admissionDate} />
        </div>

        <div>
          <label htmlFor="status" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Estado
          </label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(event) => handleStatusChange(event.target.value)}
            className={fieldClassName}
          >
            <option value="ACTIVE">Ativo</option>
            <option value="HOSPITALIZED">Hospitalizado</option>
            <option value="DISCHARGED">Alta</option>
            <option value="DECEASED">Falecido</option>
          </select>
          <FieldError messages={state.errors?.status} />
        </div>
      </div>

      <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <legend className="px-2 text-sm font-bold text-slate-800">Localização</legend>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label htmlFor="facilityId" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Lar
            </label>
            <select
              id="facilityId"
              name="facilityId"
              required
              value={facilityId}
              disabled={facilityLocked}
              onChange={(event) => handleFacilityChange(event.target.value)}
              className={fieldClassName}
            >
              <option value="">Selecione um lar</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
            {facilityLocked && <input type="hidden" name="facilityId" value={facilityId} />}
            <FieldError messages={state.errors?.facilityId} />
          </div>

          <div>
            <label htmlFor="roomId" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Quarto
            </label>
            <select
              id="roomId"
              name="roomId"
              value={roomId}
              disabled={roomDisabled}
              onChange={(event) => handleRoomChange(event.target.value)}
              className={fieldClassName}
            >
              <option value="">Sem quarto</option>
              {availableRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  Quarto {room.number}
                </option>
              ))}
            </select>
            {roomDisabled && <input type="hidden" name="roomId" value="" />}
            <FieldError messages={state.errors?.roomId} />
          </div>

          <div>
            <label htmlFor="bedId" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Cama
            </label>
            <select
              id="bedId"
              name="bedId"
              value={bedId}
              disabled={bedDisabled}
              onChange={(event) => setBedId(event.target.value)}
              className={fieldClassName}
            >
              <option value="">Sem cama</option>
              {availableBeds.map((bed) => (
                <option key={bed.id} value={bed.id}>
                  Cama {bed.identifier}
                </option>
              ))}
            </select>
            {bedDisabled && <input type="hidden" name="bedId" value="" />}
            <FieldError messages={state.errors?.bedId} />
          </div>
        </div>

        {locationDisabled && (
          <p className="mt-4 text-sm text-slate-500">
            Utentes com alta ou falecidos não podem ter quarto nem cama atribuídos.
          </p>
        )}
      </fieldset>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={resident ? `/dashboard/residents/${resident.id}` : "/dashboard/residents"}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "A guardar..." : resident ? "Guardar alterações" : "Criar utente"}
        </button>
      </div>
    </form>
  );
}
