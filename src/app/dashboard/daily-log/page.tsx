import { ModuleScaffold } from "@/components/scaffolding/ModuleScaffold";

export default function DailyLogPage() {
  return (
    <ModuleScaffold
      title="Registo Diário"
      description="Estrutura para consulta futura de registos operacionais por área profissional."
      capabilities={[
        "Registos por área profissional",
        "Organização por turno",
        "Histórico de alterações",
      ]}
    />
  );
}
