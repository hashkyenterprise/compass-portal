"use client";

import { ThemeToggle } from "@/components/theme";
import { Field, PrimaryButton, inputClass } from "@/components/ui";
import { DEMO_PASSWORD } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const { login, users } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("adrienne@compass.local");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const message = login(email, password);
    if (message) {
      setError(message);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="app-mesh relative grid min-h-screen lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="hero-gradient relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-10 top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-10 right-0 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-sm font-bold backdrop-blur">
            C
          </div>
          <span className="text-sm font-semibold">Compass Ops</span>
        </div>
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">
            West Michigan
          </p>
          <h1 className="mt-3 max-w-md text-5xl font-semibold tracking-tight">
            A premium desk for every visit.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-blue-100">
            Check-in, labs, results, and billing in one blue-and-white workspace built for Compass.
          </p>
        </div>
        <p className="relative text-xs text-blue-100/80">Demo data only. No live patient records.</p>
      </div>
      <div className="grid place-items-center px-6 py-16">
        <form onSubmit={onSubmit} className="card-premium w-full max-w-md rounded-3xl p-8">
          <p className="text-sm font-medium text-blue-600">Staff sign in</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">Welcome back</h2>
          <div className="mt-8 space-y-4">
            <Field label="Email">
              <input
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Field>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <PrimaryButton className="w-full py-2.5" type="submit">
              Continue
            </PrimaryButton>
          </div>
          <p className="mt-6 text-xs leading-5 text-slate-500">
            {users.map((u) => u.email).join(" · ")}
            <br />
            Password for every demo account: {DEMO_PASSWORD}
            <br />
            Add another test email on Staff, then sign in here in a second browser.
          </p>
        </form>
      </div>
    </div>
  );
}
