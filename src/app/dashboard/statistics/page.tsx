import { ModuleScaffold } from "@/components/scaffolding/ModuleScaffold";

export default function StatisticsPage() {
  return (
    <ModuleScaffold
      title="Estatísticas"
      description="Estrutura para indicadores agregados e acessíveis dos módulos CareLux."
      capabilities={[
        "Indicadores operacionais",
        "Indicadores de atividades",
        "Indicadores demográficos",
        "Filtros contextuais",
      ]}
    />
  );
}
