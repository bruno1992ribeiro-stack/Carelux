"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarProps {
  currentRole?: string;
}

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    short: "DB",
  },
  {
    label: "Lares",
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

type NavigationContentProps = {
  currentRole: string;
  pathname: string;
  onNavigate?: () => void;
  onClose?: () => void;
};

function NavigationContent({
  currentRole,
  pathname,
  onNavigate,
  onClose,
}: NavigationContentProps) {
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
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white shadow-sm">
            C
          </div>

          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-[0.15em] text-emerald-700">
              CARELUX
            </p>

            <p className="truncate text-xs text-slate-500">
              Premium Care Platform
            </p>
          </div>
        </Link>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-600 transition hover:bg-slate-100"
          >
            ×
          </button>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-cyan-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Perfil ativo
        </p>

        <p className="mt-2 font-semibold text-slate-900">
          {currentRole}
        </p>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
          <div className="h-full w-2/3 rounded-full bg-emerald-500" />
        </div>
      </div>

      <nav
        aria-label="Navegação principal"
        className="mt-6 flex-1 space-y-1.5"
      >
        {navigation.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={[
                "group flex min-h-12 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
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
                aria-hidden="true"
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

      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="text-xs text-slate-400">
          Gestão integrada de cuidados
        </p>

        <p className="mt-1 text-xs font-medium text-slate-500">
          CareLux © 2026
        </p>
      </div>
    </div>
  );
}

export function Sidebar({
  currentRole = "Administrador",
}: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] =
    useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Cabeçalho de telemóvel e tablet */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white">
              C
            </div>

            <div>
              <p className="text-sm font-bold tracking-[0.14em] text-emerald-700">
                CARELUX
              </p>

              <p className="text-xs text-slate-500">
                {currentRole}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={mobileOpen}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span
              aria-hidden="true"
              className="text-lg"
            >
              ☰
            </span>

            Menu
          </button>
        </div>
      </header>

      {/* Sidebar de computador */}
      <aside className="fixed bottom-6 left-6 top-6 z-30 hidden w-72 overflow-y-auto rounded-3xl border border-white/80 bg-white/95 p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)] backdrop-blur lg:block">
        <NavigationContent
          currentRole={currentRole}
          pathname={pathname}
        />
      </aside>

      {/* Menu deslizante de telemóvel e tablet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
          />

          <aside className="absolute inset-y-0 left-0 w-[min(88vw,320px)] overflow-y-auto bg-white p-5 shadow-2xl">
            <NavigationContent
              currentRole={currentRole}
              pathname={pathname}
              onNavigate={() =>
                setMobileOpen(false)
              }
              onClose={() =>
                setMobileOpen(false)
              }
            />
          </aside>
        </div>
      )}
    </>
  );
}