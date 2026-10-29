"use client";

import { FilterBar, filterClass } from "@/components/module-chrome";
import { AppShell } from "@/components/shell";
import { Card } from "@/components/ui";
import { useStore, visitExceptions } from "@/lib/store";
import { money } from "@/lib/utils";
import {
  AlertTriangle,
  Banknote,
  ClipboardCheck,
  FlaskConical,
  MailCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function BriefingPage() {
  const { visits, currentUser, settings } = useStore();
  const [range, setRange] = useState("today");
  const [location, setLocation] = useState("all");

  const scoped = useMemo(() => {
    const today = new Date().toDateString();
    return visits.filter((v) => {
      if (range === "today" && new Date(v.createdAt).toDateString() !== today) return false;
      if (location !== "all" && v.location !== location) return false;
      return true;
    });
  }, [visits, range, location]);

  const flags = visitExceptions(scoped);
  const collected = scoped.filter((v) => v.billingStatus === "paid").reduce((s, v) => s + v.amount, 0);
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Detroit",
  }).format(new Date());

  const highlights = [
    { label: "Visitors", value: String(scoped.length), hint: range === "today" ? "In this window" : "All dates", icon: Users },
    { label: "Need results", value: String(flags.missingResults.length), hint: "Still open", icon: ClipboardCheck },
    { label: "Shipments due", value: String(flags.labDue.length), hint: "Confirm delivery", icon: FlaskConical },
    { label: "Collected", value: money(collected), hint: `${flags.unpaid.length} unpaid`, icon: Banknote },
  ];

  const priorities = [
    {
      href: "/billing",
      icon: AlertTriangle,
      title: "Approve payments",
      detail: `${flags.unbilled.length} QuickBooks payments waiting.`,
    },
    {
      href: "/results",
      icon: MailCheck,
      title: "Clear result drafts",
      detail: `${flags.drafts.length} emails drafted for QC, ${flags.missingResults.length} still need a file.`,
    },
    {
      href: "/labs",
      icon: FlaskConical,
      title: "Confirm shipments",
      detail: `${flags.labDue.length} parcels due today.`,
    },
  ];

  return (
    <AppShell>
      <section className="hero-gradient relative overflow-hidden rounded-[28px] px-6 py-7 text-white shadow-lg shadow-blue-700/25">
        <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-24 w-64 rounded-full bg-sky-200/25 blur-2xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100">
            <Sparkles size={13} /> Compass · West Michigan
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Daily briefing</h1>
          <p className="mt-1 text-sm text-blue-100">
            {dateLabel}
            {currentUser?.name ? ` · prepared for ${currentUser.name}` : ""}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50/95">
            {scoped.length} visitors in this view. {flags.missingResults.length} still need results, {flags.drafts.length}{" "}
            result {flags.drafts.length === 1 ? "email is" : "emails are"} drafted, and {flags.labDue.length} lab parcels
            are due. {money(collected)} collected, {flags.unbilled.length} QuickBooks{" "}
            {flags.unbilled.length === 1 ? "payment is" : "payments are"} waiting for approval.
          </p>
        </div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-white/20 bg-white/12 px-4 py-3 backdrop-blur-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-100">{item.label}</p>
                  <Icon size={14} className="text-blue-100" />
                </div>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{item.value}</p>
                <p className="text-[11px] text-blue-100/90">{item.hint}</p>
              </div>
            );
          })}
        </div>
      </section>

      <FilterBar>
        <select className={filterClass} value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="today">Today</option>
          <option value="all">All dates</option>
        </select>
        <select className={filterClass} value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="all">All locations</option>
          {settings.locations.map((loc) => (
            <option key={loc.id} value={loc.name}>
              {loc.name}
            </option>
          ))}
        </select>
      </FilterBar>

      <div className="grid gap-3 lg:grid-cols-3">
        {priorities.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} href={item.href}>
              <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-200">
                  <Icon size={16} />
                </span>
                <p className="mt-3 text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.detail}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
