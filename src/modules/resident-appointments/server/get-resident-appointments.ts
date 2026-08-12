import { cache } from "react";
import { notFound } from "next/navigation";

import { AppError } from "@/lib/errors/app-error";
import { Permission } from "@/modules/authorization/permissions";

import { appointmentResidentIdSchema } from "../schemas/resident-appointment.schema";
import { residentAppointmentService } from "../services/resident-appointment.service";
import { getAppointmentAuthorization } from "./appointment-authorization";

export const getResidentAppointments = cache(async (residentId: string) => {
  const validatedResidentId = appointmentResidentIdSchema.parse(residentId);
  let authorization: Awaited<ReturnType<typeof getAppointmentAuthorization>>;

  try {
    authorization = await getAppointmentAuthorization(Permission.VIEW_APPOINTMENT);
  } catch (error) {
    if (error instanceof AppError && error.status === 403) {
      notFound();
    }

    throw error;
  }

  const appointments = await residentAppointmentService.list(
    validatedResidentId,
    authorization.scope,
  );

  return {
    ...appointments,
    authorization: {
      canView: true,
      canEdit: authorization.canEdit,
    },
  };
});
