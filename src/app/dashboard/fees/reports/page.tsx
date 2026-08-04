import { ModuleScaffold } from "@/components/scaffolding/ModuleScaffold";

export default function FeeReportsPage() {
  return (
    <ModuleScaffold
      title="Relatórios de Mensalidades"
      description="Estrutura apenas de leitura para relatórios financeiros futuros."
      capabilities={[
        "Relatórios por período",
        "Evolução mensal",
        "Filtros contextuais",
      ]}
      backHref="/dashboard/fees"
      backLabel="Voltar às Mensalidades"
    />
  );
}
