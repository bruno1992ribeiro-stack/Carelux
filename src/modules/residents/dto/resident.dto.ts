import type { Gender, ResidentStatus } from "@prisma/client";

export type ResidentScope = {
  clientId: string;
  facilityId?: string | null;
};

export type CreateResidentDTO = {
  facilityId: string;
  roomId: string | null;
  bedId: string | null;
  firstName: string;
  lastName: string;
  birthDate: Date | null;
  gender: Gender | null;
  admissionDate: Date | null;
  status: ResidentStatus;
};

export type UpdateResidentDTO = Partial<CreateResidentDTO>;
