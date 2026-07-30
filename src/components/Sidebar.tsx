"use client";

import Link from "next/link";
import { mainNavigation } from "@/lib/navigation";

interface SidebarProps {
  currentRole?: string;
}

export function Sidebar({ currentRole = "Administrator" }: SidebarProps) {
  console.log("SIDEBAR RENDER");

  return (
    <aside className="flex h-full w-full flex-col justify-between rounded-[28px] border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">
            CareLux
          </p>

          <h2 className="mt-2 text-xl font-semibold text-red-600">
            SIDEBAR NOVA
          </h2>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 to-sky-500/10 p-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Active role
          </p>

          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
            {currentRole}
          </p>
        </div>

        <nav aria-label="Primary" className="space-y-2">
          {mainNavigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium transition ${
                item.current
                  ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <span>{item.label}</span>
              <span>→</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
        <p className="font-semibold text-slate-900 dark:text-white">
          Accessibility
        </p>

        <p className="mt-1">
          Keyboard friendly, contrast aware, and responsive by design.
        </p>
      </div>
    </aside>
  );
}