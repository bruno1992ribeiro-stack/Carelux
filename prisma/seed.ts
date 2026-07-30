import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@carelux.pt",
    },
    update: {},

    create: {
      fullName: "Administrador",
      email: "admin@carelux.pt",
      password,
    },
  });

  console.log("✅ Administrador criado!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });