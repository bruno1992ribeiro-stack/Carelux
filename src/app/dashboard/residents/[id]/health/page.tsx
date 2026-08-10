import { HeartPulse } from "lucide-react";

import { ResidentSectionEmptyState } from "@/components/dashboard/residents/resident-section-empty-state";

export default function ResidentHealthPage() {
  return (
    <ResidentSectionEmptyState
      icon={HeartPulse}
      title="Ainda não existe informação de saúde"
      description="O modelo atual do CareLux não contém sinais vitais ou registos clínicos associados ao utente. Esta área permanece apenas de leitura até existir um fluxo clínico autorizado."
    />
  );
}
