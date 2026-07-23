import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  tone?: "default" | "accent";
}

export function DashboardCard({
  title,
  subtitle,
  children,
  tone = "default",
}: DashboardCardProps) {
  const toneClasses =
    tone === "accent"
      ? "border-emerald-200/70 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 dark:border-emerald-900/60"
      : "border-slate-200/70 bg-white/80 dark:border-slate-800/80 dark:bg-slate-950/70";

  return (
    <section className={`rounded-[24px] border p-5 shadow-sm ${toneClasses}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
