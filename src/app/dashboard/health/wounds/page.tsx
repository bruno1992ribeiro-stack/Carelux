import { ModuleScaffold } from "@/components/scaffolding/ModuleScaffold";

export default function WoundsPage() {
  return (
    <ModuleScaffold
      title="Feridas"
      description="Estrutura para acompanhamento futuro de feridas e respetivo histórico."
      capabilities={[
        "Catálogo de tipos",
        "Registos clínicos individuais",
        "Tratamentos e histórico",
      ]}
      backHref="/dashboard/health"
      backLabel="Voltar à Saúde"
    />
  );
}
