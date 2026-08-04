import { ModuleScaffold } from "@/components/scaffolding/ModuleScaffold";

export default function DailyLivingPage() {
  return (
    <ModuleScaffold
      title="Atividades de Vida Diária"
      description="Estrutura para organizar grupos, planos e atividades de vida diária."
      capabilities={[
        "Grupos de atividades",
        "Planos e atividades",
        "Organização por utente",
      ]}
    />
  );
}
