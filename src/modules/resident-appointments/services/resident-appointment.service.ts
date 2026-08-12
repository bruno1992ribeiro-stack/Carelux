import {
  AppointmentRevisionType,
  AppointmentStatus,
  type Prisma,
} from "@prisma/client";

import { AppError } from "@/lib/errors/app-error";
import type { ResidentScope } from "@/modules/residents/dto/resident.dto";

import {
  type AppointmentRecord,
  type AppointmentTransaction,
  residentAppointmentRepository,
} from "../repository/resident-appointment.repository";
import {
  appointmentCancelSchema,
  appointmentCreateSchema,
  appointmentEditSchema,
  appointmentRescheduleSchema,
  appointmentReopenSchema,
  appointmentStatusCorrectionSchema,
  type AppointmentCancelInput,
  type AppointmentCreateInput,
  type AppointmentEditInput,
  type AppointmentRescheduleInput,
  type AppointmentReopenInput,
  type AppointmentStatusCorrectionInput,
} from "../schemas/resident-appointment.schema";

async function requireResident(
  residentId: string,
  scope: ResidentScope,
  db?: AppointmentTransaction,
) {
  const resident = await residentAppointmentRepository.findAuthorizedResident(
    residentId,
    scope,
    db,
  );

  if (!resident) {
    throw new AppError("RESIDENT_NOT_FOUND", "Utente não encontrado.", 404);
  }

  return resident;
}

async function requireAppointment(
  appointmentId: string,
  residentId: string,
  db: AppointmentTransaction,
) {
  const appointment = await residentAppointmentRepository.findAppointment(
    appointmentId,
    residentId,
    db,
  );

  if (!appointment) {
    throw new AppError("APPOINTMENT_NOT_FOUND", "Consulta não encontrada.", 404);
  }

  return appointment;
}

async function validateResponsibleUser(
  responsibleUserId: string | null | undefined,
  scope: ResidentScope,
  residentFacilityId: string,
  db: AppointmentTransaction,
) {
  if (!responsibleUserId) {
    return null;
  }

  const user = await residentAppointmentRepository.findResponsibleUser(
    responsibleUserId,
    scope,
    residentFacilityId,
    db,
  );

  if (!user) {
    throw new AppError(
      "RESPONSIBLE_USER_NOT_FOUND",
      "O profissional interno não pertence ao âmbito autorizado.",
      400,
    );
  }

  return user.id;
}

function revisionData(
  appointment: AppointmentRecord,
  changedById: string,
  changeType: AppointmentRevisionType,
  changeReason?: string | null,
): Prisma.ResidentAppointmentRevisionUncheckedCreateInput {
  return {
    appointmentId: appointment.id,
    changedById,
    changeType,
    changeReason: changeReason ?? null,
    scheduledAt: appointment.scheduledAt,
    status: appointment.status,
    type: appointment.type,
    specialty: appointment.specialty,
    professionalName: appointment.professionalName,
    responsibleUserId: appointment.responsibleUserId,
    location: appointment.location,
    reason: appointment.reason,
    observations: appointment.observations,
    completedAt: appointment.completedAt,
    completedById: appointment.completedById,
    cancelledAt: appointment.cancelledAt,
    cancelledById: appointment.cancelledById,
    cancellationReason: appointment.cancellationReason,
  };
}

function requireUpdated(count: number, message: string) {
  if (count !== 1) {
    throw new AppError("APPOINTMENT_STATE_CONFLICT", message, 409);
  }
}

function requireScheduled(appointment: AppointmentRecord) {
  if (appointment.status !== AppointmentStatus.SCHEDULED) {
    throw new AppError(
      "APPOINTMENT_NOT_SCHEDULED",
      "A operação só é permitida numa consulta agendada.",
      409,
    );
  }
}

export const residentAppointmentService = {
  async list(residentId: string, scope: ResidentScope) {
    const resident = await requireResident(residentId, scope);
    const appointments = await residentAppointmentRepository.findByResidentId(resident.id);

    return {
      upcoming: appointments
        .filter((appointment) => appointment.status === AppointmentStatus.SCHEDULED)
        .sort((left, right) => left.scheduledAt.getTime() - right.scheduledAt.getTime()),
      history: appointments
        .filter((appointment) => appointment.status !== AppointmentStatus.SCHEDULED)
        .sort((left, right) => right.scheduledAt.getTime() - left.scheduledAt.getTime()),
    };
  },

  async create(
    residentId: string,
    scope: ResidentScope,
    userId: string,
    input: AppointmentCreateInput,
  ) {
    const data = appointmentCreateSchema.parse(input);

    return residentAppointmentRepository.transaction(async (tx) => {
      const resident = await requireResident(residentId, scope, tx);
      const responsibleUserId = await validateResponsibleUser(
        data.responsibleUserId,
        scope,
        resident.facilityId,
        tx,
      );

      return residentAppointmentRepository.createAppointment(
        {
          ...data,
          responsibleUserId,
          residentId: resident.id,
          facilityId: resident.facilityId,
          createdById: userId,
          lastModifiedById: userId,
          status: AppointmentStatus.SCHEDULED,
        },
        tx,
      );
    });
  },

  async edit(
    residentId: string,
    appointmentId: string,
    scope: ResidentScope,
    userId: string,
    input: AppointmentEditInput,
  ) {
    const data = appointmentEditSchema.parse(input);

    return residentAppointmentRepository.transaction(async (tx) => {
      const resident = await requireResident(residentId, scope, tx);
      const appointment = await requireAppointment(appointmentId, resident.id, tx);
      requireScheduled(appointment);
      const responsibleUserId = await validateResponsibleUser(
        data.responsibleUserId,
        scope,
        resident.facilityId,
        tx,
      );

      await residentAppointmentRepository.createRevision(
        revisionData(appointment, userId, AppointmentRevisionType.EDITED),
        tx,
      );
      const result = await residentAppointmentRepository.updateAppointment(
        appointment.id,
        resident.id,
        { ...data, responsibleUserId, lastModifiedById: userId },
        AppointmentStatus.SCHEDULED,
        tx,
      );
      requireUpdated(result.count, "A consulta deixou de estar agendada.");
    });
  },

  async reschedule(
    residentId: string,
    scope: ResidentScope,
    userId: string,
    input: AppointmentRescheduleInput,
  ) {
    const data = appointmentRescheduleSchema.parse(input);

    return residentAppointmentRepository.transaction(async (tx) => {
      const resident = await requireResident(residentId, scope, tx);
      const appointment = await requireAppointment(data.appointmentId, resident.id, tx);
      requireScheduled(appointment);
      await residentAppointmentRepository.createRevision(
        revisionData(
          appointment,
          userId,
          AppointmentRevisionType.RESCHEDULED,
          data.changeReason,
        ),
        tx,
      );
      const result = await residentAppointmentRepository.updateAppointment(
        appointment.id,
        resident.id,
        { scheduledAt: data.scheduledAt, lastModifiedById: userId },
        AppointmentStatus.SCHEDULED,
        tx,
      );
      requireUpdated(result.count, "A consulta deixou de estar agendada.");
    });
  },

  async complete(
    residentId: string,
    appointmentId: string,
    scope: ResidentScope,
    userId: string,
  ) {
    return residentAppointmentRepository.transaction(async (tx) => {
      const resident = await requireResident(residentId, scope, tx);
      const appointment = await requireAppointment(appointmentId, resident.id, tx);
      requireScheduled(appointment);
      await residentAppointmentRepository.createRevision(
        revisionData(appointment, userId, AppointmentRevisionType.COMPLETED),
        tx,
      );
      const now = new Date();
      const result = await residentAppointmentRepository.updateAppointment(
        appointment.id,
        resident.id,
        {
          status: AppointmentStatus.COMPLETED,
          completedAt: now,
          completedById: userId,
          cancelledAt: null,
          cancelledById: null,
          cancellationReason: null,
          lastModifiedById: userId,
        },
        AppointmentStatus.SCHEDULED,
        tx,
      );
      requireUpdated(result.count, "A consulta deixou de estar agendada.");
    });
  },

  async cancel(
    residentId: string,
    scope: ResidentScope,
    userId: string,
    input: AppointmentCancelInput,
  ) {
    const data = appointmentCancelSchema.parse(input);

    return residentAppointmentRepository.transaction(async (tx) => {
      const resident = await requireResident(residentId, scope, tx);
      const appointment = await requireAppointment(data.appointmentId, resident.id, tx);
      requireScheduled(appointment);
      await residentAppointmentRepository.createRevision(
        revisionData(appointment, userId, AppointmentRevisionType.CANCELLED),
        tx,
      );
      const now = new Date();
      const result = await residentAppointmentRepository.updateAppointment(
        appointment.id,
        resident.id,
        {
          status: AppointmentStatus.CANCELLED,
          cancelledAt: now,
          cancelledById: userId,
          cancellationReason: data.cancellationReason,
          completedAt: null,
          completedById: null,
          lastModifiedById: userId,
        },
        AppointmentStatus.SCHEDULED,
        tx,
      );
      requireUpdated(result.count, "A consulta deixou de estar agendada.");
    });
  },

  async reopen(
    residentId: string,
    scope: ResidentScope,
    userId: string,
    input: AppointmentReopenInput,
  ) {
    const data = appointmentReopenSchema.parse(input);

    return residentAppointmentRepository.transaction(async (tx) => {
      const resident = await requireResident(residentId, scope, tx);
      const appointment = await requireAppointment(data.appointmentId, resident.id, tx);

      if (appointment.status === AppointmentStatus.SCHEDULED) {
        throw new AppError("APPOINTMENT_ALREADY_SCHEDULED", "A consulta já está agendada.", 409);
      }

      await residentAppointmentRepository.createRevision(
        revisionData(
          appointment,
          userId,
          AppointmentRevisionType.REOPENED,
          data.changeReason,
        ),
        tx,
      );
      const result = await residentAppointmentRepository.updateAppointment(
        appointment.id,
        resident.id,
        {
          status: AppointmentStatus.SCHEDULED,
          completedAt: null,
          completedById: null,
          cancelledAt: null,
          cancelledById: null,
          cancellationReason: null,
          lastModifiedById: userId,
        },
        appointment.status,
        tx,
      );
      requireUpdated(result.count, "O estado da consulta foi alterado por outro utilizador.");
    });
  },

  async correctStatus(
    residentId: string,
    scope: ResidentScope,
    userId: string,
    input: AppointmentStatusCorrectionInput,
  ) {
    const data = appointmentStatusCorrectionSchema.parse(input);

    return residentAppointmentRepository.transaction(async (tx) => {
      const resident = await requireResident(residentId, scope, tx);
      const appointment = await requireAppointment(data.appointmentId, resident.id, tx);

      if (
        appointment.status === AppointmentStatus.SCHEDULED ||
        appointment.status === data.targetStatus
      ) {
        throw new AppError(
          "APPOINTMENT_STATUS_NOT_CORRECTABLE",
          "Use as ações normais para alterar uma consulta agendada.",
          409,
        );
      }

      await residentAppointmentRepository.createRevision(
        revisionData(
          appointment,
          userId,
          AppointmentRevisionType.STATUS_CORRECTED,
          data.changeReason,
        ),
        tx,
      );
      const now = new Date();
      const targetCompleted = data.targetStatus === AppointmentStatus.COMPLETED;
      const result = await residentAppointmentRepository.updateAppointment(
        appointment.id,
        resident.id,
        {
          status: data.targetStatus,
          completedAt: targetCompleted ? now : null,
          completedById: targetCompleted ? userId : null,
          cancelledAt: targetCompleted ? null : now,
          cancelledById: targetCompleted ? null : userId,
          cancellationReason: targetCompleted ? null : data.cancellationReason,
          lastModifiedById: userId,
        },
        appointment.status,
        tx,
      );
      requireUpdated(result.count, "O estado da consulta foi alterado por outro utilizador.");
    });
  },
};
