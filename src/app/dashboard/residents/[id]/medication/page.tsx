import { Pill } from "lucide-react";

import { ResidentSectionEmptyState } from "@/components/dashboard/residents/resident-section-empty-state";

export default function ResidentMedicationPage() {
  return (
    <ResidentSectionEmptyState
      icon={Pill}
      title="Ainda não existe medicação associada"
      description="O CareLux ainda não dispõe de prescrições ou administrações de medicação associadas ao utente. Não são apresentadas ações sem validação e autorização reais."
    />
  );
}
