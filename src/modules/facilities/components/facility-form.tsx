import { createFacility } from "../actions/create-facility";
import { updateFacility } from "../actions/update-facility";

type FacilityFormProps = {
  facility?: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    phone: string | null;
    email: string | null;
  };
};

export function FacilityForm({ facility }: FacilityFormProps) {
  console.log("FORM RECEIVED:", facility);

  return (
    <form
      action={
        facility
          ? updateFacility.bind(null, facility.id)
          : createFacility
      }
      className="space-y-6"
    >
      <h2 className="text-xl font-bold">
        {facility ? "EDITAR LAR" : "NOVO LAR"}
      </h2>

      <input
        name="name"
        defaultValue={facility?.name ?? ""}
        className="w-full rounded border p-2"
      />

      <input
        name="city"
        defaultValue={facility?.city ?? ""}
        className="w-full rounded border p-2"
      />

      <input
        name="address"
        defaultValue={facility?.address ?? ""}
        className="w-full rounded border p-2"
      />

      <input
        name="postalCode"
        defaultValue={facility?.postalCode ?? ""}
        className="w-full rounded border p-2"
      />

      <input
        name="phone"
        defaultValue={facility?.phone ?? ""}
        className="w-full rounded border p-2"
      />

      <input
        name="email"
        type="email"
        defaultValue={facility?.email ?? ""}
        className="w-full rounded border p-2"
      />

      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        {facility ? "Atualizar" : "Guardar"}
      </button>
    </form>
  );
}