import type { LucideIcon } from "lucide-react";

type ResidentSectionEmptyStateProps = {
  description: string;
  icon: LucideIcon;
  title: string;
};

export function ResidentSectionEmptyState({
  description,
  icon: Icon,
  title,
}: ResidentSectionEmptyStateProps) {
  return (
    <section className="card-warm px-5 py-10 text-center sm:px-8">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon aria-hidden="true" size={24} strokeWidth={1.8} />
      </span>
      <h2 className="mt-4 text-base font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-5 text-muted-foreground">
        {description}
      </p>
    </section>
  );
}
