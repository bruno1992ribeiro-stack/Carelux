"use client";

import type { LucideIcon } from "lucide-react";
import type { RefObject } from "react";
import {
  Building2,
  ChartNoAxesColumn,
  ChevronRight,
  ClipboardList,
  ContactRound,
  FileUser,
  HeartPulse,
  House,
  ListChecks,
  MoreHorizontal,
  Pill,
  Settings,
  Sparkles,
  Users,
  UserRoundCog,
  UserRoundSearch,
  WalletCards,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

interface SidebarProps {
  currentRole?: string;
}

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  mobilePrimary?: boolean;
  desktopOnly?: boolean;
  activeHrefs?: readonly string[];
  mobileActiveHrefs?: readonly string[];
  exact?: boolean;
  group: "Principal" | "Operação" | "Saúde" | "Gestão" | "Administração";
};

const navigation: NavigationItem[] = [
  {
    label: "Início",
    href: "/dashboard",
    icon: House,
    mobilePrimary: true,
    group: "Principal",
  },
  {
    label: "Unidades",
    href: "/dashboard/facilities",
    icon: Building2,
    mobilePrimary: true,
    activeHrefs: [
      "/dashboard/rooms",
      "/dashboard/beds",
    ],
    mobileActiveHrefs: ["/dashboard/residents"],
    group: "Principal",
  },
  {
    label: "Utentes",
    href: "/dashboard/residents",
    icon: Users,
    desktopOnly: true,
    group: "Principal",
  },
  {
    label: "Familiares",
    href: "/dashboard/contacts",
    icon: ContactRound,
    group: "Gestão",
  },
  {
    label: "Funcionários",
    href: "/dashboard/staff",
    icon: UserRoundCog,
    group: "Administração",
  },
  {
    label: "Clientes",
    href: "/dashboard/clients",
    icon: UserRoundSearch,
    group: "Administração",
  },
  {
    label: "Definições",
    href: "/dashboard/settings",
    icon: Settings,
    group: "Administração",
  },
  {
    label: "Registos",
    href: "/dashboard/daily-log",
    icon: ClipboardList,
    mobilePrimary: true,
    mobileActiveHrefs: ["/dashboard/daily-living"],
    group: "Operação",
  },
  {
    label: "Atividades de Vida Diária",
    href: "/dashboard/daily-living",
    icon: ListChecks,
    group: "Operação",
  },
  {
    label: "Desenvolvimento Pessoal",
    href: "/dashboard/personal-development",
    icon: Sparkles,
    group: "Operação",
  },
  {
    label: "Saúde",
    href: "/dashboard/health",
    icon: HeartPulse,
    exact: true,
    activeHrefs: [
      "/dashboard/health/appointments",
      "/dashboard/health/vaccinations",
      "/dashboard/health/wounds",
    ],
    group: "Saúde",
  },
  {
    label: "Medicação",
    href: "/dashboard/health/therapeutics",
    icon: Pill,
    mobilePrimary: true,
    group: "Saúde",
  },
  {
    label: "Estatísticas",
    href: "/dashboard/statistics",
    icon: ChartNoAxesColumn,
    group: "Gestão",
  },
  {
    label: "Mensalidades",
    href: "/dashboard/fees",
    icon: WalletCards,
    group: "Gestão",
  },
  {
    label: "Candidaturas",
    href: "/dashboard/applications",
    icon: FileUser,
    group: "Gestão",
  },
];

const navigationGroups: NavigationItem["group"][] = [
  "Principal",
  "Operação",
  "Saúde",
  "Gestão",
  "Administração",
];

const mobileNavigation = navigation.filter((item) => !item.desktopOnly);
const primaryNavigation = mobileNavigation.filter((item) => item.mobilePrimary);
const secondaryNavigation = mobileNavigation.filter(
  (item) => !item.mobilePrimary,
);

function isItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isNavigationItemActive(pathname: string, item: NavigationItem) {
  return (
    (item.exact ? pathname === item.href : isItemActive(pathname, item.href)) ||
    item.activeHrefs?.some((href) => isItemActive(pathname, href)) === true
  );
}

function isMobileNavigationItemActive(pathname: string, item: NavigationItem) {
  return (
    isNavigationItemActive(pathname, item) ||
    item.mobileActiveHrefs?.some((href) => isItemActive(pathname, href)) === true
  );
}

type DesktopLinkProps = {
  item: NavigationItem;
  pathname: string;
};

function DesktopLink({ item, pathname }: DesktopLinkProps) {
  const active = isNavigationItemActive(pathname, item);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={[
        "group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
          active ? "bg-primary/10" : "bg-background group-hover:bg-card",
        ].join(" ")}
      >
        <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
      </span>
      <span className="flex-1">{item.label}</span>
      <ChevronRight
        aria-hidden="true"
        size={16}
        strokeWidth={1.8}
        className={active ? "text-primary" : "text-muted-light"}
      />
    </Link>
  );
}

type MorePanelProps = {
  open: boolean;
  pathname: string;
  onClose: () => void;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function MorePanel({
  open,
  pathname,
  onClose,
  closeButtonRef,
}: MorePanelProps) {
  if (!open) {
    return null;
  }

  function handlePanelKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(focusableSelector),
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (!firstElement || !lastElement) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        aria-label="Fechar navegação adicional"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/40"
      />
      <section
        id="mobile-more-navigation"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-more-title"
        tabIndex={-1}
        onKeyDown={handlePanelKeyDown}
        className="card-warm animate-fade-slide-up absolute inset-x-0 bottom-0 max-h-[min(75dvh,36rem)] overflow-y-auto rounded-b-none rounded-t-[1.5rem] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(45,42,38,0.08)]"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#D4C9BA]" />
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 id="mobile-more-title" className="font-display text-xl leading-7">
            Mais
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar painel Mais"
            className="interactive-target rounded-xl text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
          >
            <X aria-hidden="true" size={22} strokeWidth={1.8} />
          </button>
        </div>
        <nav
          aria-label="Navegação adicional"
          className="grid gap-2 sm:grid-cols-2"
        >
          {secondaryNavigation.map((item) => {
            const active = isNavigationItemActive(pathname, item);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-primary/5",
                ].join(" ")}
              >
                <Icon aria-hidden="true" size={21} strokeWidth={1.8} />
                <span className="flex-1">{item.label}</span>
                <ChevronRight aria-hidden="true" size={16} strokeWidth={1.8} />
              </Link>
            );
          })}
        </nav>
      </section>
    </div>
  );
}

export function Sidebar({ currentRole = "Administrador" }: SidebarProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const primaryActive = primaryNavigation.some((item) =>
    isMobileNavigationItemActive(pathname, item),
  );
  const secondaryActive = !primaryActive && secondaryNavigation.some((item) =>
    isNavigationItemActive(pathname, item),
  );

  function openMorePanel() {
    setMoreOpen(true);
    requestAnimationFrame(() => closeButtonRef.current?.focus());
  }

  function closeMorePanel() {
    setMoreOpen(false);
    requestAnimationFrame(() => moreButtonRef.current?.focus());
  }

  return (
    <>
      <aside className="card-warm fixed bottom-6 left-6 top-6 z-30 hidden w-72 overflow-y-auto p-5 lg:flex lg:flex-col">
        <Link
          href="/dashboard"
          aria-label="CareLux — Início"
          className="flex min-h-11 items-center gap-3 rounded-xl"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-[var(--shadow-primary)]">
            C
          </span>
          <span className="min-w-0">
            <span className="font-display block truncate text-2xl leading-8 text-foreground">
              CareLux
            </span>
            <span className="block truncate text-xs leading-4 text-muted-foreground">
              Gestão de cuidados
            </span>
          </span>
        </Link>

        <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Perfil ativo
          </p>
          <p className="mt-1.5 truncate text-sm font-semibold text-foreground">
            {currentRole}
          </p>
        </div>

        <nav
          aria-label="Navegação principal"
          className="mt-5 flex-1 space-y-1"
        >
          {navigationGroups.map((group) => (
            <div key={group} className="mt-4 first:mt-0">
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-light">
                {group}
              </p>
              <div className="space-y-1">
                {navigation
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <DesktopLink
                      key={item.href}
                      item={item}
                      pathname={pathname}
                    />
                  ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs leading-4 text-muted-foreground">
            Gestão integrada de cuidados
          </p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            CareLux © 2026
          </p>
        </div>
      </aside>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-30 h-[calc(4.3rem+env(safe-area-inset-bottom))] border-t border-border bg-[var(--navigation-background)] pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
      >
        <div className="mx-auto grid h-[4.3rem] max-w-2xl grid-cols-5 gap-1 px-2 pt-2">
          {primaryNavigation.map((item) => {
            const active = isMobileNavigationItemActive(pathname, item);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] leading-[15px] transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
                ].join(" ")}
              >
                <Icon aria-hidden="true" size={22} strokeWidth={1.8} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
          <button
            ref={moreButtonRef}
            type="button"
            onClick={openMorePanel}
            aria-label="Mais opções"
            aria-expanded={moreOpen}
            aria-controls="mobile-more-navigation"
            aria-current={secondaryActive ? "page" : undefined}
            className={[
              "flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] leading-[15px] transition-colors",
              secondaryActive || moreOpen
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
            ].join(" ")}
          >
            <MoreHorizontal aria-hidden="true" size={22} strokeWidth={1.8} />
            <span>Mais</span>
          </button>
        </div>
      </nav>

      <MorePanel
        open={moreOpen}
        pathname={pathname}
        onClose={closeMorePanel}
        closeButtonRef={closeButtonRef}
      />
    </>
  );
}
