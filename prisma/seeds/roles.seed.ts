import type { Prisma } from "@prisma/client";

import { Role } from "../../src/modules/authorization/roles";

const roles: ReadonlyArray<{
  code: Role;
  name: string;
  description: string;
  isSystem: boolean;
}> = [
  {
    code: Role.SUPER_ADMIN,
    name: "Super Administrador",
    description: "Administração técnica da plataforma CareLux.",
    isSystem: true,
  },
  {
    code: Role.ADMIN,
    name: "Administrador",
    description: "CEO ou administrador global do cliente, com acesso a todos os seus lares.",
    isSystem: true,
  },
  {
    code: Role.FACILITY_ADMIN,
    name: "Administrador de Lar",
    description: "Administrador limitado ao lar ao qual está associado.",
    isSystem: true,
  },
  {
    code: Role.WAREHOUSE_MANAGER,
    name: "Responsável de Armazém",
    description: "Responsável pelo inventário, pedidos e entregas.",
    isSystem: true,
  },
  {
    code: Role.DIRECTOR,
    name: "Diretor Técnico",
    description: "Responsável pela direção técnica da instituição.",
    isSystem: true,
  },
  {
    code: Role.DOCTOR,
    name: "Médico",
    description: "Profissional médico.",
    isSystem: true,
  },
  {
    code: Role.NURSE,
    name: "Enfermeiro",
    description: "Profissional de enfermagem.",
    isSystem: true,
  },
  {
    code: Role.PHYSIOTHERAPIST,
    name: "Fisioterapeuta",
    description: "Profissional de fisioterapia.",
    isSystem: true,
  },
  {
    code: Role.OCCUPATIONAL_THERAPIST,
    name: "Terapeuta Ocupacional",
    description: "Profissional de terapia ocupacional.",
    isSystem: true,
  },
  {
    code: Role.SPEECH_THERAPIST,
    name: "Terapeuta da Fala",
    description: "Profissional de terapia da fala.",
    isSystem: true,
  },
  {
    code: Role.PSYCHOLOGIST,
    name: "Psicólogo",
    description: "Profissional de psicologia.",
    isSystem: true,
  },
  {
    code: Role.NUTRITIONIST,
    name: "Nutricionista",
    description: "Profissional de nutrição.",
    isSystem: true,
  },
  {
    code: Role.SOCIAL_WORKER,
    name: "Assistente Social",
    description: "Profissional de serviço social.",
    isSystem: true,
  },
  {
    code: Role.CAREGIVER,
    name: "Auxiliar",
    description: "Auxiliar de ação direta.",
    isSystem: true,
  },
  {
    code: Role.RECEPTIONIST,
    name: "Rececionista",
    description: "Responsável pela receção e pelo agendamento de consultas.",
    isSystem: true,
  },
  {
    code: Role.ADMINISTRATIVE,
    name: "Administrativo",
    description: "Profissional administrativo.",
    isSystem: true,
  },
  {
    code: Role.FAMILY,
    name: "Familiar",
    description: "Utilizador do portal da família.",
    isSystem: true,
  },
  {
    code: Role.EXTERNAL_AUDITOR,
    name: "Auditor Externo",
    description: "Auditor com acesso de leitura explicitamente limitado.",
    isSystem: true,
  },
];

export async function seedRoles(client: Prisma.TransactionClient) {
  for (const role of roles) {
    await client.role.upsert({
      where: { code: role.code },
      update: {
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
      },
      create: role,
    });
  }

  console.log("Roles sincronizadas.");
}
