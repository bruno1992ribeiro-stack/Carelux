import { prisma } from "../../src/lib/prisma";

const permissions = [
  // Residentes
  "VIEW_RESIDENT",
  "CREATE_RESIDENT",
  "EDIT_RESIDENT",
  "ARCHIVE_RESIDENT",

  // Processo Clínico
  "VIEW_CLINICAL_RECORD",
  "EDIT_CLINICAL_RECORD",

  // Medicação
  "VIEW_MEDICATION",
  "EDIT_MEDICATION",

  // Documentos
  "VIEW_DOCUMENT",
  "CREATE_DOCUMENT",
  "DELETE_DOCUMENT",
  "DOWNLOAD_DOCUMENT",
  "PRINT_DOCUMENT",

  // Funcionários
  "VIEW_EMPLOYEES",
  "EDIT_EMPLOYEES",

  // Financeiro
  "VIEW_FINANCE",
  "EDIT_FINANCE",

  // Utilizadores
  "MANAGE_USERS",

  // Auditoria
  "VIEW_AUDIT",

  // Exportação
  "EXPORT_DATA",

  // Família
  "VIEW_FAMILY",
  "SEND_MESSAGES",
];

export async function seedPermissions() {
  for (const code of permissions) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: {
        code,
        name: code,
      },
    });
  }

  console.log("✅ Permissions seeded");
}