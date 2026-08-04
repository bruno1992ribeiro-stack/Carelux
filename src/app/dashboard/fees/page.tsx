import { FileText, Package } from "lucide-react";

import { ModuleScaffold } from "@/components/scaffolding/ModuleScaffold";

const feeLinks = [
  {
    title: "Produtos",
    description: "Estrutura do catálogo de produtos associados a mensalidades.",
    href: "/dashboard/fees/products",
    icon: Package,
  },
  {
    title: "Relatórios",
    description: "Estrutura para consulta futura de relatórios financeiros.",
    href: "/dashboard/fees/reports",
    icon: FileText,
  },
] as const;

export default function FeesPage() {
  return (
    <ModuleScaffold
      title="Mensalidades"
      description="Ponto de entrada apenas de leitura para as áreas financeiras em preparação."
      capabilities={[
        "Pesquisa de mensalidades",
        "Evolução mensal",
        "Consulta por período",
      ]}
      links={feeLinks}
    />
  );
}
