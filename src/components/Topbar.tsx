"use client";

import { useTheme } from "@/hooks/use-theme";

interface TopbarProps {
  title: string;
  description: string;
}

export function Topbar({ title, description }: TopbarProps) {
  const { isDark, setIsDark } = useTheme();

  return (
    <header className="flex flex-col gap-4 rounded-[28px] border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Premium care operations
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label="Toggle color theme"
        >
          {isDark ? "☀️ Light" : "🌙 Dark"}
        </button>
        <div className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
          24/7 Care Ready
        </div>
      </div>
    </header>
  );
}
