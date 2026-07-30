import { getCurrentUser } from "./session";

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Utilizador não autenticado.");
  }

  return user;
}

export async function requireClient() {
  const user = await requireUser();

  if (!user.client) {
    throw new Error("Cliente não encontrado.");
  }

  return user.client;
}

export async function requireFacility() {
  const user = await requireUser();

  if (!user.facility) {
    throw new Error("Utilizador não pertence a nenhuma unidade.");
  }

  return user.facility;
}

export async function requireRole() {
  const user = await requireUser();

  if (!user.role) {
    throw new Error("Perfil não encontrado.");
  }

  return user.role;
}