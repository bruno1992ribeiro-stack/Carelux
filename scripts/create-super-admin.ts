import "dotenv/config";

import bcrypt from "bcrypt";
import { z } from "zod";

import { prisma } from "../src/lib/prisma";
import { Role } from "../src/modules/authorization/roles";

const superAdminInputSchema = z.object({
  email: z
    .string()
    .trim()
    .email("SUPER_ADMIN_EMAIL deve conter um email válido.")
    .transform((value) => value.toLowerCase()),
  name: z
    .string()
    .trim()
    .min(2, "SUPER_ADMIN_NAME deve ter pelo menos 2 caracteres."),
  password: z
    .string()
    .min(12, "SUPER_ADMIN_PASSWORD deve ter pelo menos 12 caracteres.")
    .regex(/[a-z]/, "SUPER_ADMIN_PASSWORD deve incluir uma letra minúscula.")
    .regex(/[A-Z]/, "SUPER_ADMIN_PASSWORD deve incluir uma letra maiúscula.")
    .regex(/[0-9]/, "SUPER_ADMIN_PASSWORD deve incluir um número."),
});

async function main() {
  const requiredVariables = [
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_NAME",
    "SUPER_ADMIN_PASSWORD",
  ] as const;
  const missingVariables = requiredVariables.filter(
    (name) => !process.env[name]?.trim(),
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Variáveis obrigatórias em falta: ${missingVariables.join(", ")}.`,
    );
  }

  const parsedInput = superAdminInputSchema.safeParse({
    email: process.env.SUPER_ADMIN_EMAIL,
    name: process.env.SUPER_ADMIN_NAME,
    password: process.env.SUPER_ADMIN_PASSWORD,
  });

  if (!parsedInput.success) {
    const messages = parsedInput.error.issues.map((issue) => issue.message);

    throw new Error(`Dados inválidos:\n- ${messages.join("\n- ")}`);
  }

  const { email, name, password } = parsedInput.data;

  const role = await prisma.role.findFirst({
    where: {
      code: Role.SUPER_ADMIN,
      clientId: null,
      isSystem: true,
    },
    select: {
      id: true,
    },
  });

  if (!role) {
    throw new Error(
      "Role SUPER_ADMIN global não encontrada. Execute primeiro os seeds canónicos.",
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    throw new Error("Já existe um utilizador com o email indicado.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      fullName: name,
      password: passwordHash,
      clientId: null,
      facilityId: null,
      roleId: role.id,
      active: true,
    },
  });

  console.log("Conta SUPER_ADMIN global criada com sucesso.");
  console.log(`Email: ${email}`);
  console.log("Cliente: nenhum");
  console.log("Unidade: nenhuma");
}

main()
  .catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro inesperado.";

    console.error(`Não foi possível criar a conta SUPER_ADMIN: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
