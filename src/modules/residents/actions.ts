"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { AppError } from "@/lib/errors/app-error";
import { getFacilityReadScopeForUser } from "@/lib/facility-read-scope";
import { requirePermission } from "@/lib/permissions";
import { getCurrentClientUser } from "@/lib/session";
import { Permission } from "@/modules/authorization/permissions";

import { residentService } from "./services/resident.service";
import {
  residentSchema,
  updateResidentSchema,
} from "./schemas/resident.schema";

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

const RESIDENT_PATH = "/dashboard/residents";
const RELATED_PATHS = [
  RESIDENT_PATH,
  "/dashboard/beds",
  "/dashboard/rooms",
] as const;

function revalidateResidentPaths() {
  for (const path of RELATED_PATHS) {
    revalidatePath(path);
  }
}

function getFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(fieldErrors).filter(
      (entry): entry is [string, string[]] => Boolean(entry[1])
    )
  );
}

function getErrorState(error: unknown): ActionState {
  if (error instanceof z.ZodError) {
    return {
      success: false,
      message: "Verifique os campos indicados.",
      errors: getFieldErrors(error),
    };
  }

  if (error instanceof AppError) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: false,
    message: "Não foi possível concluir a operação.",
  };
}

async function getAuthenticatedScope(permission: Permission) {
  const user = await getCurrentClientUser();
  requirePermission(user, permission);
  const scope = getFacilityReadScopeForUser(user);

  return {
    clientId: scope.clientId,
    facilityId: scope.type === "facility" ? scope.facilityId : undefined,
  };
}

function getCreateInput(formData: FormData) {
  return {
    facilityId: String(formData.get("facilityId") ?? ""),
    roomId: String(formData.get("roomId") ?? ""),
    bedId: String(formData.get("bedId") ?? ""),
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    admissionDate: String(formData.get("admissionDate") ?? ""),
    status: String(formData.get("status") ?? "ACTIVE"),
  };
}

function getUpdateInput(formData: FormData) {
  const input: Record<string, FormDataEntryValue> = {};

  for (const field of [
    "facilityId",
    "roomId",
    "bedId",
    "firstName",
    "lastName",
    "birthDate",
    "gender",
    "admissionDate",
    "status",
  ]) {
    const value = formData.get(field);

    if (value !== null) {
      input[field] = value;
    }
  }

  return input;
}

export async function createResident(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const scope = await getAuthenticatedScope(Permission.CREATE_RESIDENT);
    const validated = residentSchema.parse(getCreateInput(formData));

    await residentService.create(scope, validated);
  } catch (error) {
    return getErrorState(error);
  }

  revalidateResidentPaths();
  redirect(RESIDENT_PATH);
}

export async function updateResident(
  id: string,
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const scope = await getAuthenticatedScope(Permission.EDIT_RESIDENT);
    const validated = updateResidentSchema.parse(getUpdateInput(formData));

    await residentService.update(id, scope, validated);
  } catch (error) {
    return getErrorState(error);
  }

  revalidateResidentPaths();
  redirect(RESIDENT_PATH);
}
