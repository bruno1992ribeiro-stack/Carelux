import type { Prisma } from "@prisma/client";

import { Permission } from "../../src/modules/authorization/permissions";

const permissionDescriptions: Record<Permission, string> = {
  [Permission.VIEW_RESIDENT]: "Consultar utentes.",
  [Permission.CREATE_RESIDENT]: "Criar utentes.",
  [Permission.EDIT_RESIDENT]: "Editar utentes.",
  [Permission.ARCHIVE_RESIDENT]: "Arquivar utentes.",
  [Permission.RESTORE_RESIDENT]: "Restaurar utentes arquivados",
  [Permission.VIEW_CLINICAL_RECORD]: "Consultar informação clínica.",
  [Permission.EDIT_CLINICAL_RECORD]: "Criar, corrigir e anular registos clínicos.",
  [Permission.EDIT_PATHOLOGY]: "Criar, editar e desativar patologias.",
  [Permission.EDIT_ALLERGY]: "Criar, corrigir e desativar alergias.",
  [Permission.VIEW_MEDICATION]: "Consultar medicação.",
  [Permission.EDIT_MEDICATION]: "Criar, editar e desativar medicação.",
  [Permission.VIEW_APPOINTMENT]: "Consultar consultas.",
  [Permission.EDIT_APPOINTMENT]: "Criar, editar, concluir e cancelar consultas.",
  [Permission.VIEW_DOCUMENT]: "Consultar documentos.",
  [Permission.CREATE_DOCUMENT]: "Criar documentos.",
  [Permission.DELETE_DOCUMENT]: "Eliminar documentos.",
  [Permission.DOWNLOAD_DOCUMENT]: "Descarregar documentos.",
  [Permission.PRINT_DOCUMENT]: "Imprimir documentos.",
  [Permission.VIEW_EMPLOYEES]: "Consultar funcionários.",
  [Permission.EDIT_EMPLOYEES]: "Editar funcionários.",
  [Permission.VIEW_FINANCE]: "Consultar informação financeira e faturação.",
  [Permission.EDIT_FINANCE]: "Editar informação financeira e faturação.",
  [Permission.VIEW_INVENTORY]: "Consultar inventário.",
  [Permission.EDIT_INVENTORY]: "Editar inventário.",
  [Permission.CREATE_INVENTORY_REQUEST]: "Criar pedidos de inventário.",
  [Permission.PROCESS_INVENTORY_REQUEST]: "Processar pedidos e entregas de inventário.",
  [Permission.MANAGE_USERS]: "Gerir utilizadores.",
  [Permission.VIEW_AUDIT]: "Consultar auditoria.",
  [Permission.EXPORT_DATA]: "Exportar dados.",
  [Permission.VIEW_FAMILY]: "Consultar informação destinada à família.",
  [Permission.SEND_MESSAGES]: "Enviar mensagens.",
};

export async function seedPermissions(client: Prisma.TransactionClient) {
  for (const permission of Object.values(Permission)) {
    const description = permissionDescriptions[permission];

    await client.permission.upsert({
      where: { code: permission },
      update: {
        description,
        name: permission,
      },
      create: {
        code: permission,
        name: permission,
        description,
      },
    });
  }

  console.log("Permissões sincronizadas.");
}
