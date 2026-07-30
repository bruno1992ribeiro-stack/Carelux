import { prisma } from "../../src/lib/prisma";

const roles = [
  {
    code: "SUPER_ADMIN",
    name: "Super Administrador",
    description: "Acesso total ao sistema",
    isSystem: true,
  },
  {
    code: "ADMIN",
    name: "Administrador",
    description: "Administrador do lar",
    isSystem: true,
  },
  {
    code: "DIRECTOR",
    name: "Diretor Técnico",
    description: "Gestão técnica da instituição",
    isSystem: true,
  },
  {
    code: "DOCTOR",
    name: "Médico",
    description: "Profissional médico",
    isSystem: true,
  },
  {
    code: "NURSE",
    name: "Enfermeiro",
    description: "Profissional de enfermagem",
    isSystem: true,
  },
  {
    code: "PHYSIOTHERAPIST",
    name: "Fisioterapeuta",
    description: "Profissional de fisioterapia",
    isSystem: true,
  },
  {
    code: "OCCUPATIONAL_THERAPIST",
    name: "Terapeuta Ocupacional",
    description: "Profissional de terapia ocupacional",
    isSystem: true,
  },
  {
    code: "PSYCHOLOGIST",
    name: "Psicólogo",
    description: "Profissional de psicologia",
    isSystem: true,
  },
  {
    code: "NUTRITIONIST",
    name: "Nutricionista",
    description: "Profissional de nutrição",
    isSystem: true,
  },
  {
    code: "SOCIAL_WORKER",
    name: "Assistente Social",
    description: "Profissional de serviço social",
    isSystem: true,
  },
  {
    code: "CAREGIVER",
    name: "Auxiliar",
    description: "Auxiliar de ação direta",
    isSystem: true,
  },
  {
    code: "RECEPTION",
    name: "Receção",
    description: "Rececionista",
    isSystem: true,
  },
  {
    code: "FAMILY",
    name: "Familiar",
    description: "Portal da família",
    isSystem: true,
  },
];

export async function seedRoles() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        code: role.code,
      },
      update: {},
      create: role,
    });
  }

  console.log("✅ Roles seeded");
}