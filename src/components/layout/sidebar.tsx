"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  currentRole: string;
};

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    short: "DB",
  },
  {
    label: "Unidades",
    href: "/dashboard/facilities",
    short: "LR",
  },
  {
    label: "Utentes",
    href: "/dashboard/residents",
    short: "UT",
  },
  {
    label: "Quartos",
    href: "/dashboard/rooms",
    short: "QT",
  },
  {
    label: "Camas",
    href: "/dashboard/beds",
    short: "CM",
  },
  {
    label: "Familiares",
    href: "/dashboard/contacts",
    short: "FM",
  },
  {
    label: "Funcionários",
    href: "/dashboard/staff",
    short: "FN",
  },
  {
    label: "Clientes",
    href: "/dashboard/clients",
    short: "CL",
  },
  {
    label: "Definições",
    href: "/dashboard/settings",
    short: "DF",
  },
];

export function Sidebar({
  currentRole,
}: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <aside className="w-full shrink-0 rounded-3xl border border-white/80 bg-white/95 p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)] backdrop-blur lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72 lg:overflow-y-auto">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white shadow-sm">
          C
        </div>

        <div>
          <p className="text-lg font-bold tracking-[0.16em] text-emerald-700">
            CARELUX
          </p>

          <p className="text-xs text-slate-500">
            Premium Care Platform
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-cyan-50 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
          Perfil ativo
        </p>

        <p className="mt-2 font-semibold text-slate-900">
          {currentRole}
        </p>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
          <div className="h-full w-2/3 rounded-full bg-emerald-500" />
        </div>
      </div>

      <nav className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {navigation.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold transition",
                  active
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-white",
                ].join(" ")}
              >
                {item.short}
              </span>

              <span className="flex-1">
                {item.label}
              </span>

              <span
                className={
                  active
                    ? "text-white/70"
                    : "text-slate-400"
                }
              >
                →
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-slate-100 px-2 pt-5">
        <p className="text-xs text-slate-400">
          Gestão integrada de cuidados
        </p>

        <p className="mt-1 text-xs font-medium text-slate-500">
          CareLux © 2026
        </p>
      </div>
    </aside>
  );
}
