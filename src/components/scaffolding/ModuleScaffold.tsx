import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ArrowRight, Construction } from "lucide-react";
import Link from "next/link";

type ModuleLink = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

type ModuleScaffoldProps = {
  title: string;
  description: string;
  capabilities: readonly string[];
  links?: readonly ModuleLink[];
  backHref?: string;
  backLabel?: string;
};

export function ModuleScaffold({
  title,
  description,
  capabilities,
  links = [],
  backHref,
  backLabel = "Voltar",
}: ModuleScaffoldProps) {
  return (
    <div className="min-w-0 space-y-6">
      <header className="space-y-3">
        {backHref ? (
          <Link
            href={backHref}
            className="interactive-target w-fit gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
          >
            <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.8} />
            {backLabel}
          </Link>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-2xl leading-8 text-foreground">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-5 text-muted-foreground">
              {description}
            </p>
          </div>
          <span className="w-fit shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            Módulo em preparação
          </span>
        </div>
      </header>

      {links.length > 0 ? (
        <section aria-labelledby="module-links-title">
          <h2
            id="module-links-title"
            className="text-sm font-semibold text-foreground"
          >
            Áreas do módulo
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="card-warm group flex min-h-32 items-start gap-4 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5 sm:p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon aria-hidden="true" size={22} strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-xs leading-4 text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    size={18}
                    strokeWidth={1.8}
                    className="mt-3 shrink-0 text-muted-light transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="planned-title" className="card-warm p-5 sm:p-6">
        <h2 id="planned-title" className="text-sm font-semibold text-foreground">
          Funcionalidades previstas
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {capabilities.map((capability) => (
            <li
              key={capability}
              className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-white/40 px-3 py-2 text-sm text-muted-foreground"
            >
              <Construction
                aria-hidden="true"
                size={18}
                strokeWidth={1.8}
                className="shrink-0 text-primary"
              />
              {capability}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-dashed border-[#D4C9BA] px-5 py-8 text-center">
        <Construction
          aria-hidden="true"
          size={24}
          strokeWidth={1.8}
          className="mx-auto text-muted-light"
        />
        <h2 className="mt-3 text-sm font-semibold text-foreground">
          Ainda não existe informação neste módulo
        </h2>
        <p className="mx-auto mt-1 max-w-md text-xs leading-4 text-muted-foreground">
          A estrutura está preparada. As funcionalidades serão implementadas
          apenas após validação funcional e de permissões.
        </p>
      </section>
    </div>
  );
}
