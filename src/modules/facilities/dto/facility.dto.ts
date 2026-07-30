import type { FacilityInput } from "../schemas/facility.schema";

export type CreateFacilityDTO = FacilityInput;

export type UpdateFacilityDTO = Partial<FacilityInput>;