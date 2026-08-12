import type { AppointmentStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ResidentScope } from "@/modules/residents/dto/resident.dto";

export type AppointmentTransaction = Prisma.TransactionClient;
type AppointmentDb = typeof prisma | AppointmentTransaction;

function residentScopeWhere(scope: ResidentScope): Prisma.ResidentWhereInput {
  return {
    facility: { clientId: scope.clientId },
    ...(scope.facilityId ? { facilityId: scope.facilityId } : {}),
  };
}

const userDisplaySelect = {
  id: true,
  fullName: true,
  role: { select: { name: true } },
} satisfies Prisma.UserSelect;

export const residentAppointmentRepository = {
  transaction<T>(callback: (tx: AppointmentTransaction) => Promise<T>) {
    return prisma.$transaction(callback, { isolationLevel: "Serializable" });
  },

  findAuthorizedResident(id: string, scope: ResidentScope, db: AppointmentDb = prisma) {
    return db.resident.findFirst({
      where: { id, ...residentScopeWhere(scope) },
      select: { id: true, facilityId: true },
    });
  },

  findResponsibleUser(
    id: string,
    scope: ResidentScope,
    residentFacilityId: string,
    db: AppointmentDb = prisma,
  ) {
    return db.user.findFirst({
      where: {
        id,
        active: true,
        clientId: scope.clientId,
        ...(scope.facilityId
          ? { facilityId: residentFacilityId }
          : {}),
      },
      select: { id: true },
    });
  },

  findByResidentId(residentId: string, db: AppointmentDb = prisma) {
    return db.residentAppointment.findMany({
      where: { residentId },
      include: {
        responsibleUser: { select: userDisplaySelect },
        createdBy: { select: userDisplaySelect },
        lastModifiedBy: { select: userDisplaySelect },
        completedBy: { select: userDisplaySelect },
        cancelledBy: { select: userDisplaySelect },
        facility: { select: { id: true, name: true } },
        revisions: {
          include: { changedBy: { select: userDisplaySelect } },
          orderBy: { changedAt: "desc" },
        },
      },
      orderBy: [{ scheduledAt: "asc" }, { createdAt: "asc" }],
    });
  },

  findAppointment(id: string, residentId: string, db: AppointmentDb = prisma) {
    return db.residentAppointment.findFirst({ where: { id, residentId } });
  },

  createAppointment(
    data: Prisma.ResidentAppointmentUncheckedCreateInput,
    db: AppointmentDb = prisma,
  ) {
    return db.residentAppointment.create({ data });
  },

  createRevision(
    data: Prisma.ResidentAppointmentRevisionUncheckedCreateInput,
    db: AppointmentDb = prisma,
  ) {
    return db.residentAppointmentRevision.create({ data });
  },

  updateAppointment(
    id: string,
    residentId: string,
    data: Prisma.ResidentAppointmentUncheckedUpdateManyInput,
    expectedStatus?: AppointmentStatus,
    db: AppointmentDb = prisma,
  ) {
    return db.residentAppointment.updateMany({
      where: { id, residentId, ...(expectedStatus ? { status: expectedStatus } : {}) },
      data,
    });
  },
};

export type AppointmentRecord = NonNullable<
  Awaited<ReturnType<typeof residentAppointmentRepository.findAppointment>>
>;
