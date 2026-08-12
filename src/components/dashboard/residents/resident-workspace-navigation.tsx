"use client";

import {
  CalendarDays,
  ClipboardList,
  HeartPulse,
  LayoutDashboard,
  Pill,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type ResidentWorkspaceNavigationProps = {
  canViewAppointments: boolean;
  canViewClinical: boolean;
  residentId: string;
};

type ResidentSection = {
  exact?: boolean;
  href: string;
  icon: LucideIcon;
  label: string;
};

export function ResidentWorkspaceNavigation({
  canViewAppointments,
  canViewClinical,
  residentId,
}: ResidentWorkspaceNavigationProps) {
  const pathname = usePathname();
  const basePath = `/dashboard/residents/${residentId}`;
  const sections: ResidentSection[] = [
    {
      exact: true,
      href: basePath,
      icon: LayoutDashboard,
      label: "Resumo",
    },
    {
      href: `${basePath}/records`,
      icon: ClipboardList,
      label: "Registos",
    },
    ...(canViewClinical
      ? [
          {
            href: `${basePath}/health`,
            icon: HeartPulse,
            label: "Saúde",
          },
        ]
      : []),
    ...(canViewAppointments
      ? [
          {
            href: `${basePath}/appointments`,
            icon: CalendarDays,
            label: "Consultas",
          },
        ]
      : []),
    {
      href: `${basePath}/medication`,
      icon: Pill,
      label: "Medicação",
    },
  ];

  return (
    <nav aria-label="Áreas do utente" className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-2">
        {sections.map((section) => {
          const active = section.exact
            ? pathname === section.href
            : pathname === section.href ||
              pathname.startsWith(`${section.href}/`);
          const Icon = section.icon;

          return (
            <Link
              key={section.href}
              href={section.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:bg-primary/5 hover:text-foreground",
              )}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
              {section.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
