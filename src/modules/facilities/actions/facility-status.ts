"use server";

import { revalidatePath } from "next/cache";

import { AppError } from "@/lib/errors/app-error";
import { getCurrentUser } from "@/lib/session";
import { Role } from "@/modules/authorization/roles";

import { facilityService } from "../services/facility.service";

export type FacilityStatusActionState = {
  success: boolean;
  message: string;
};

const initialError: FacilityStatusActionState = {
  success: false,
  message: "Não foi possível concluir a operação.",
};

async function requireTenantAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError(
      "UNAUTHENTICATED",
      "A sessão terminou. Inicie sessão novamente.",
      401
    );
  }

  if (!user.clientId || user.role?.code !== Role.ADMIN) {
    throw new AppError(
      "FORBIDDEN",
      "Não tem permissão para alterar o estado deste lar.",
      403
    );
  }

  return user;
}

function getErrorState(error: unknown): FacilityStatusActionState {
  if (error instanceof AppError) {
    return { success: false, message: error.message };
  }

  return initialError;
}

function revalidateFacilityPaths() {
  revalidatePath("/dashboard/facilities");
  revalidatePath("/dashboard");
}

export async function deactivateFacility(
  id: string,
  _previousState: FacilityStatusActionState
): Promise<FacilityStatusActionState> {
  void _previousState;

  try {
    const user = await requireTenantAdmin();
    await facilityService.deactivate(id, user.clientId, user.facilityId);
  } catch (error) {
    return getErrorState(error);
  }

  revalidateFacilityPaths();
  return { success: true, message: "Lar desativado com sucesso." };
}

export async function reactivateFacility(
  id: string,
  _previousState: FacilityStatusActionState
): Promise<FacilityStatusActionState> {
  void _previousState;

  try {
    const user = await requireTenantAdmin();
    await facilityService.reactivate(id, user.clientId);
  } catch (error) {
    return getErrorState(error);
  }

  revalidateFacilityPaths();
  return { success: true, message: "Lar reativado com sucesso." };
}
