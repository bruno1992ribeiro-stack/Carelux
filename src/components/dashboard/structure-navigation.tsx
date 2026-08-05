import Link from "next/link";

import {
  FacilityListFilter,
  type FacilityFilterOption,
} from "@/components/dashboard/facility-list-filter";
import { cn } from "@/lib/utils";

export type StructureSection =
  | "facilities"
  | "rooms"
  | "beds"
  | "residents";

type SearchParamValue = string | string[] | undefined;

type StructureNavigationProps = {
  activeSection: StructureSection;
  basePath: string;
  facilities: FacilityFilterOption[];
  facilityCount: number;
  searchParams?: Record<string, SearchParamValue>;
  selectedFacilityId: string | null;
};

const sections: Array<{
  href: string;
  label: string;
  value: Exclude<StructureSection, "facilities">;
}> = [
  { href: "/dashboard/rooms", label: "Quartos", value: "rooms" },
  { href: "/dashboard/beds", label: "Camas", value: "beds" },
  { href: "/dashboard/residents", label: "Utentes", value: "residents" },
];

export function StructureNavigation({
  activeSection,
  basePath,
  facilities,
  facilityCount,
  searchParams,
  selectedFacilityId,
}: StructureNavigationProps) {
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

      <nav aria-label="Áreas da unidade" className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2">
          {sections.map((section) => {
            const active = section.value === activeSection;
            const href = selectedFacilityId
              ? `${section.href}?facilityId=${encodeURIComponent(selectedFacilityId)}`
              : section.href;

            return (
              <Link
                key={section.value}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                )}
              >
                {active && (
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                )}
                {section.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
