import { ModuleScaffold } from "@/components/scaffolding/ModuleScaffold";

export default function ApplicationsPage() {
  return (
    <ModuleScaffold
      title="Candidaturas"
      description="Estrutura para acompanhar candidaturas, critérios e respetivo histórico."
      capabilities={[
        "Pesquisa de candidaturas",
        "Critérios de avaliação",
        "Histórico de candidaturas",
      ]}
    />
  );
}
