import Link from "next/link";

import { cn } from "@/lib/utils";

export type FacilityFilterOption = {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

type SearchParamValue = string | string[] | undefined;

type FacilityListFilterProps = {
  basePath: string;
  facilities: FacilityFilterOption[];
  selectedFacilityId: string | null;
  searchParams?: Record<string, SearchParamValue>;
};

function createFilterHref(
  basePath: string,
  searchParams: Record<string, SearchParamValue>,
  facilityId: string | null
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "facilityId" || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
    } else {
      params.set(key, value);
    }
  }

  if (facilityId) {
    params.set("facilityId", facilityId);
  }

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
}

export function FacilityListFilter({
  basePath,
  facilities,
  selectedFacilityId,
  searchParams = {},
}: FacilityListFilterProps) {
  const options: Array<{
    id: string | null;
    label: string;
  }> = [
    { id: null, label: "Todos" },
    ...facilities.map((facility) => ({
      id: facility.id,
      label:
        facility.status === "INACTIVE"
          ? `${facility.name} · Inativo`
          : facility.name,
    })),
  ];

  return (
    <nav aria-label="Selecionar unidade" className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-2">
        {options.map((option) => {
          const selected = option.id === selectedFacilityId;

          return (
            <Link
              key={option.id ?? "all"}
              href={createFilterHref(basePath, searchParams, option.id)}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                selected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:bg-primary/5 hover:text-foreground"
              )}
            >
              {selected && (
                <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
              )}
              {option.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
