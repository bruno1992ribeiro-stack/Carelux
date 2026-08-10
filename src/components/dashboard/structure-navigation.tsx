import Link from "next/link";
import { BedDouble, DoorOpen, Users, type LucideIcon } from "lucide-react";

import {
  FacilityListFilter,
  type FacilityFilterOption,
} from "@/components/dashboard/facility-list-filter";
import { cn } from "@/lib/utils";

export type StructureSection =
  | "facilities"
  | "rooms"
  | "beds";

type SearchParamValue = string | string[] | undefined;

type StructureNavigationProps = {
  activeSection: StructureSection;
  basePath: string;
  facilities: FacilityFilterOption[];
  facilityCount: number;
  searchParams?: Record<string, SearchParamValue>;
  selectedFacilityId: string | null;
  variant?: "compact" | "dashboard";
};

export const structureSections: Array<{
  href: string;
  icon: LucideIcon;
  label: string;
  value: Exclude<StructureSection, "facilities">;
}> = [
  {
    href: "/dashboard/rooms",
    icon: DoorOpen,
    label: "Quartos",
    value: "rooms",
  },
  {
    href: "/dashboard/beds",
    icon: BedDouble,
    label: "Camas",
    value: "beds",
  },
];

const residentSection = {
  href: "/dashboard/residents",
  icon: Users,
  label: "Utentes",
  value: "residents",
} as const;

export function StructureNavigation({
  activeSection,
  basePath,
  facilities,
  facilityCount,
  searchParams,
  selectedFacilityId,
  variant = "compact",
}: StructureNavigationProps) {
  const visibleSections =
    variant === "dashboard"
      ? [residentSection, ...structureSections]
      : structureSections;
  const facilityLabel = facilityCount === 1 ? "Unidade" : "Unidades";
  const facilityHref = selectedFacilityId
    ? `/dashboard/facilities?facilityId=${encodeURIComponent(selectedFacilityId)}`
    : "/dashboard/facilities";

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Contexto de unidade">
        <Link
          href={facilityHref}
          aria-current={activeSection === "facilities" ? "page" : undefined}
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
            activeSection === "facilities"
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
          )}
        >
          {activeSection === "facilities" && (
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
          )}
          {facilityLabel}
        </Link>
      </nav>

      <FacilityListFilter
        basePath={basePath}
        facilities={facilities}
        selectedFacilityId={selectedFacilityId}
        searchParams={searchParams}
      />

      <nav
        aria-label="Áreas da unidade"
        className={variant === "compact" ? "overflow-x-auto pb-1" : undefined}
      >
        <div
          className={cn(
            variant === "dashboard"
              ? "grid gap-3 sm:grid-cols-3"
              : "flex min-w-max gap-2"
          )}
        >
          {visibleSections.map((section) => {
            const active = section.value === activeSection;
            const Icon = section.icon;
            const href = selectedFacilityId
              ? `${section.href}?facilityId=${encodeURIComponent(selectedFacilityId)}`
              : section.href;

            return (
              <Link
                key={section.value}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group inline-flex items-center rounded-xl border font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                  variant === "dashboard"
                    ? "card-warm min-h-24 justify-start gap-4 px-5 py-4 text-base text-foreground hover:border-primary/30 hover:bg-primary/5"
                    : "min-h-11 justify-center gap-2 whitespace-nowrap px-4 py-2 text-sm",
                  variant === "compact" &&
                    (active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:bg-primary/5 hover:text-foreground")
                )}
              >
                {variant === "dashboard" ? (
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <Icon aria-hidden="true" size={22} strokeWidth={1.8} />
                  </span>
                ) : active ? (
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                ) : null}
                {section.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
