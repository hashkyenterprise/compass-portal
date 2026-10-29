"use client";

import { AppShell } from "@/components/shell";
import { Card } from "@/components/ui";
import { VisitTable } from "@/components/visit-table";
import { useStore, visitExceptions } from "@/lib/store";
import { money } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  MailCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

export default function DashboardPage() {
  const { visits, currentUser } = useStore();
  const today = new Date().toDateString();
  const todays = visits.filter((v) => new Date(v.createdAt).toDateString() === today);
  const flags = visitExceptions(visits);
  const collected = visits.filter((v) => v.billingStatus === "paid").reduce((sum, v) => sum + v.amount, 0);
  const outstanding = visits
    .filter((v) => ["invoiced", "overdue", "payment_received"].includes(v.billingStatus))
    .reduce((sum, v) => sum + v.amount, 0);
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats: Array<{
    label: string;
    value: string;
    hint: string;
    href: string;
    icon: ComponentType<{ size?: number }>;
    tint: string;
  }> = [
    {
      label: "Checked in",
      value: String(todays.length),
      hint: "Today on the floor",
      href: "/visits",
      icon: Users,
      tint: "from-blue-500 to-sky-400",
    },
    {
      label: "Need results",
      value: String(flags.missingResults.length),
      hint: "Same-day or lab",
      href: "/results",
      icon: ClipboardCheck,
      tint: "from-indigo-500 to-blue-400",
    },
    {
      label: "Approve pay",
      value: String(flags.unbilled.length),
      hint: "QuickBooks received",
      href: "/billing",
      icon: CheckCircle2,
      tint: "from-violet-500 to-indigo-400",
    },
    {
      label: "Collected",
      value: money(collected),
      hint: `${money(outstanding)} still open`,
      href: "/billing",
      icon: Banknote,
      tint: "from-emerald-500 to-teal-400",
    },
  ];

  const exceptions = [
    { label: "Approve payments", value: flags.unbilled.length, href: "/billing", icon: CheckCircle2, color: "text-violet-700 bg-violet-50" },
    { label: "Missing results", value: flags.missingResults.length, href: "/results", icon: ClipboardCheck, color: "text-blue-700 bg-blue-50" },
    { label: "Overdue invoices", value: flags.overdue.length, href: "/billing", icon: AlertTriangle, color: "text-rose-700 bg-rose-50" },
    { label: "Shipments due", value: flags.labDue.length, href: "/labs", icon: FlaskConical, color: "text-sky-700 bg-sky-50" },
    { label: "Drafts to QC", value: flags.drafts.length, href: "/results", icon: MailCheck, color: "text-indigo-700 bg-indigo-50" },
  ];

  return (
    <AppShell>
      <div className="flex h-[calc(100dvh-2rem)] min-h-0 flex-col gap-3">
        <section className="hero-gradient relative shrink-0 overflow-hidden rounded-[22px] px-5 py-4 text-white shadow-lg shadow-blue-700/25">
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-16 w-48 rounded-full bg-sky-200/20 blur-2xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-100">
                Compass · West Michigan
              </p>
              <h1 className="truncate text-[22px] font-semibold tracking-tight">
                {hello}
                {currentUser?.name ? `, ${currentUser.name}` : ""}
              </h1>
              <p className="mt-0.5 text-xs text-blue-100">
                {todays.length} check-ins today · invoices go out automatically
              </p>
            </div>
            <Link
              href="/briefing"
              className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-xs font-semibold backdrop-blur hover:bg-white/25 md:inline-flex"
            >
              <Sparkles size={14} /> Daily briefing <ArrowUpRight size={12} />
            </Link>
          </div>
        </section>

        <div className="grid shrink-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href}>
                <Card className="px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {stat.label}
                      </p>
                      <p className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-950">
                        {stat.value}
                      </p>
                      <p className="text-[11px] text-slate-500">{stat.hint}</p>
                    </div>
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${stat.tint} text-white shadow-md shadow-blue-500/20`}
                    >
                      <Icon size={16} />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid min-h-0 flex-1 basis-0 gap-3 lg:grid-cols-3">
          <Card className="flex h-full min-h-0 flex-col p-3.5">
            <p className="text-sm font-semibold text-slate-950">Needs attention</p>
            <p className="text-[11px] text-slate-500">Tap a row to jump in</p>
            <ul className="mt-2 space-y-1">
              {exceptions.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between rounded-xl px-1.5 py-2 hover:bg-blue-50/80"
                    >
                      <span className="flex items-center gap-2.5 text-[13px] text-slate-700">
                        <span className={`grid h-8 w-8 place-items-center rounded-xl ${item.color}`}>
                          <Icon size={15} />
                        </span>
                        {item.label}
                      </span>
                      <span
                        className={`min-w-7 rounded-full px-2 py-0.5 text-center text-[12px] font-semibold ${
                          item.value > 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.value}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card className="flex h-full min-h-0 flex-col overflow-hidden lg:col-span-2">
            <div className="flex shrink-0 items-center justify-between border-b border-blue-50 px-4 py-2.5">
              <div>
                <p className="text-sm font-semibold">Today’s visits</p>
                <p className="text-[11px] text-slate-500">View or edit from the action column</p>
              </div>
              <Link href="/visits" className="text-xs font-semibold text-blue-600 dark:text-blue-300">
                All visits
              </Link>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <VisitTable visits={todays} compact />
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
