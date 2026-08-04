import { ModuleScaffold } from "@/components/scaffolding/ModuleScaffold";

export default function PersonalDevelopmentPage() {
  return (
    <ModuleScaffold
      title="Desenvolvimento Pessoal"
      description="Estrutura para planeamento, acompanhamento e consulta de atividades."
      capabilities={[
        "Calendário de atividades",
        "Mapa de atividades",
        "Presenças e ausências",
        "Relatórios",
      ]}
    />
  );
}
