import { ModuleScaffold } from "@/components/scaffolding/ModuleScaffold";

export default function FeeProductsPage() {
  return (
    <ModuleScaffold
      title="Produtos de Mensalidades"
      description="Estrutura apenas de leitura para o futuro catálogo de produtos."
      capabilities={["Catálogo de produtos", "Associação a mensalidades"]}
      backHref="/dashboard/fees"
      backLabel="Voltar às Mensalidades"
    />
  );
}
