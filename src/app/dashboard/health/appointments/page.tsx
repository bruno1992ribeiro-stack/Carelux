import { ModuleScaffold } from "@/components/scaffolding/ModuleScaffold";

export default function AppointmentsPage() {
  return (
    <ModuleScaffold
      title="Consultas"
      description="Estrutura para agenda e acompanhamento futuro de consultas."
      capabilities={[
        "Vistas de dia e semana",
        "Vista em lista",
        "Agenda de consultas",
        "Relatórios",
      ]}
      backHref="/dashboard/health"
      backLabel="Voltar à Saúde"
    />
  );
}
