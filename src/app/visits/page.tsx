"use client";

import { FilterBar, FilterSearch, StatRow, filterClass } from "@/components/module-chrome";
import { AppShell } from "@/components/shell";
import { Card } from "@/components/ui";
import { VisitTable } from "@/components/visit-table";
import { visitHasService } from "@/lib/catalog";
import { stageLabel } from "@/lib/labels";
import { useStore } from "@/lib/store";
import type { VisitStage } from "@/lib/types";
import { ClipboardList, FlaskConical, Plus, Timer, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function VisitsPage() {
  const { visits, settings } = useStore();
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("all");
  const [service, setService] = useState("all");
  const [path, setPath] = useState("all");
  const [stage, setStage] = useState("all");

  const today = new Date().toDateString();
  const stats = [
    {
      label: "Total visits",
      value: String(visits.length),
      hint: "All records",
      icon: ClipboardList,
      tint: "from-blue-500 to-sky-400",
    },
    {
      label: "Today",
      value: String(visits.filter((v) => new Date(v.createdAt).toDateString() === today).length),
      hint: "Checked in today",
      icon: Users,
      tint: "from-indigo-500 to-blue-400",
    },
    {
      label: "Lab path",
      value: String(visits.filter((v) => v.resultPath === "lab").length),
      hint: "Specimen sent out",
      icon: FlaskConical,
      tint: "from-sky-500 to-cyan-400",
    },
    {
      label: "Open stages",
      value: String(visits.filter((v) => v.stage !== "closed" && v.stage !== "results_delivered").length),
      hint: "Not closed yet",
      icon: Timer,
      tint: "from-amber-500 to-orange-400",
    },
  ];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return visits.filter((v) => {
      if (term && !`${v.visitNumber} ${v.firstName} ${v.lastName} ${v.payerName} ${v.service}`.toLowerCase().includes(term)) {
        return false;
      }
      if (location !== "all" && v.location !== location) return false;
      if (service !== "all" && !visitHasService(v, service)) return false;
      if (path !== "all" && v.resultPath !== path) return false;
      if (stage !== "all" && v.stage !== stage) return false;
      return true;
    });
  }, [q, visits, location, service, path, stage]);

  return (
    <AppShell>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-950">Visits</h1>
          <p className="text-sm text-slate-500">Every check-in, from walk-in to closed.</p>
        </div>
        <Link
          href="/visits/new"
          className="btn-gradient inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={16} /> New visit
        </Link>
      </div>
      <StatRow items={stats} />
      <FilterBar>
        <FilterSearch value={q} onChange={setQ} placeholder="Search name, payer, or visit #" />
        <select className={filterClass} value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="all">All locations</option>
          {settings.locations.map((loc) => (
            <option key={loc.id} value={loc.name}>
              {loc.name}
            </option>
          ))}
        </select>
        <select className={filterClass} value={service} onChange={(e) => setService(e.target.value)}>
          <option value="all">All services</option>
          {settings.services.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <select className={filterClass} value={path} onChange={(e) => setPath(e.target.value)}>
          <option value="all">All result paths</option>
          <option value="same_day">Same-day</option>
          <option value="lab">Send to lab</option>
        </select>
        <select className={filterClass} value={stage} onChange={(e) => setStage(e.target.value as VisitStage | "all")}>
          <option value="all">All stages</option>
          {Object.entries(stageLabel).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </FilterBar>
      <Card>
        <VisitTable visits={filtered} compact />
      </Card>
    </AppShell>
  );
}
