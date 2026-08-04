import { Bandage, CalendarDays, Pill, Syringe } from "lucide-react";

import { ModuleScaffold } from "@/components/scaffolding/ModuleScaffold";

const healthLinks = [
  {
    title: "Consultas",
    description: "Estrutura para agenda e acompanhamento de consultas.",
    href: "/dashboard/health/appointments",
    icon: CalendarDays,
  },
  {
    title: "Vacinação",
    description: "Acesso à estrutura de acompanhamento de vacinação.",
    href: "/dashboard/health/vaccinations",
    icon: Syringe,
  },
  {
    title: "Terapêuticas",
    description: "Acesso à estrutura de consulta de terapêuticas.",
    href: "/dashboard/health/therapeutics",
    icon: Pill,
  },
  {
    title: "Feridas",
    description: "Acesso à estrutura de acompanhamento de feridas.",
    href: "/dashboard/health/wounds",
    icon: Bandage,
  },
] as const;

export default function HealthPage() {
  return (
    <ModuleScaffold
      title="Saúde"
      description="Ponto de entrada para os módulos clínicos em preparação no CareLux."
      capabilities={[
        "Informação geral de saúde",
        "Acesso condicionado por permissões",
        "Histórico e auditoria",
      ]}
      links={healthLinks}
    />
  );
}
