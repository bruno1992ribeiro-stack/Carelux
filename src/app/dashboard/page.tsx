import { DashboardCard } from "@/components/DashboardCard";
import { PageContainer } from "@/components/PageContainer";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { getRoleById } from "@/services/role-service";

export default function DashboardPage() {
  const role = getRoleById("administrator");

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#f7fdf9_0%,_#f7fbff_100%)] px-3 py-3 text-slate-900 transition-colors dark:bg-[linear-gradient(135deg,_#020617_0%,_#0f172a_100%)] dark:text-slate-100 sm:px-4 lg:px-6">
      <PageContainer>
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Sidebar currentRole={role.label} />

          <div className="space-y-6">
            <Topbar
              title="Operations overview"
              description="A calm and accessible command center for premium care services."
            />

            <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <DashboardCard title="Care coverage" subtitle="Live readiness across services" tone="accent">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Nursing homes", value: "96%" },
                    { label: "Assisted living", value: "91%" },
                    { label: "Home care", value: "89%" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/60 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                      <p className="text-sm text-slate-600 dark:text-slate-300">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </DashboardCard>

              <DashboardCard title="Care roles" subtitle="Prepared personas for the platform">
                <div className="space-y-3">
                  {[
                    { label: "Administrator", detail: "Operational oversight" },
                    { label: "Employee", detail: "Daily care routines" },
                    { label: "Family", detail: "Private updates" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/70">
                      <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <DashboardCard title="Resident experience" subtitle="Service highlights and wellness status">
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <li className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/70">Medication tracking is organized for each care unit.</li>
                  <li className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/70">Family check-ins are grouped by priority and schedule.</li>
                </ul>
              </DashboardCard>

              <DashboardCard title="Today’s focus" subtitle="Thoughtful layout for daily operations">
                <div className="rounded-2xl border border-dashed border-emerald-300 p-4 text-sm text-slate-600 dark:border-emerald-700 dark:text-slate-300">
                  The foundation is ready for future workflows, analytics, and modules.
                </div>
              </DashboardCard>
            </section>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
