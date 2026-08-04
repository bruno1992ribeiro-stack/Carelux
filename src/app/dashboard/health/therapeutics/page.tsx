import { ModuleScaffold } from "@/components/scaffolding/ModuleScaffold";

export default function TherapeuticsPage() {
  return (
    <ModuleScaffold
      title="Terapêuticas"
      description="Estrutura para consulta futura de terapêuticas e medicação."
      capabilities={[
        "Pesquisa por utente",
        "Vista por medicamento",
        "Histórico auditável",
      ]}
      backHref="/dashboard/health"
      backLabel="Voltar à Saúde"
    />
  );
}
