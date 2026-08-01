"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getRoleOptions } from "@/features/auth/roles";

export default function LoginPage() {
  const roles = getRoleOptions();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email ou password inválidos.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_55%),linear-gradient(135deg,_#f8fdfb_0%,_#f5f8ff_100%)] px-4 py-8 text-slate-900 transition-colors dark:bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.2),_transparent_45%),linear-gradient(135deg,_#020617_0%,_#0f172a_100%)] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 rounded-[32px] border border-slate-200/70 bg-white/80 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur lg:flex-row lg:items-stretch lg:p-8 dark:border-slate-800/80 dark:bg-slate-950/70">
        <section className="flex-1 rounded-[28px] bg-slate-950 p-8 text-white dark:bg-slate-900">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">
            CareLux
          </p>

          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Trusted care experiences for every household.
          </h1>

          <p className="mt-4 max-w-xl text-base text-slate-300 sm:text-lg">
            A calm, secure experience for care teams, administrators, and
            families to stay aligned.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className="rounded-2xl border border-white/10 bg-white/10 p-4"
              >
                <p className="text-sm font-semibold">{role.label}</p>
                <p className="mt-1 text-sm text-slate-300">
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex-1 rounded-[28px] border border-slate-200/70 bg-slate-50/80 p-8 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Secure access
              </p>

              <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                Sign in to CareLux
              </h2>
            </div>

            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              UI only
            </span>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Email

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@carelux.com"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Password

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>

            <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-300">
              Choose a role to preview the experience.
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500"
            >
              Iniciar sessão
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
