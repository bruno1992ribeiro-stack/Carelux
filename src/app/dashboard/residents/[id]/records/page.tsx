import { ClipboardList } from "lucide-react";

import { ResidentSectionEmptyState } from "@/components/dashboard/residents/resident-section-empty-state";

export default function ResidentRecordsPage() {
  return (
    <ResidentSectionEmptyState
      icon={ClipboardList}
      title="Ainda não existem registos assistenciais"
      description="O CareLux ainda não dispõe de um modelo de registos assistenciais associado ao utente. Não são apresentadas ações até existir um fluxo completo e autorizado."
    />
  );
}
