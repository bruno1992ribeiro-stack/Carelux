import { ModuleScaffold } from "@/components/scaffolding/ModuleScaffold";

export default function VaccinationsPage() {
  return (
    <ModuleScaffold
      title="Vacinação"
      description="Estrutura para acompanhamento futuro de vacinação."
      capabilities={[
        "Catálogo de vacinas",
        "Registos de vacinação",
        "Histórico auditável",
      ]}
      backHref="/dashboard/health"
      backLabel="Voltar à Saúde"
    />
  );
}
