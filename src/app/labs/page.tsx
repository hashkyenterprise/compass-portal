"use client";

import { FilterBar, FilterSearch, StatRow, filterClass } from "@/components/module-chrome";
import { AppShell } from "@/components/shell";
import { Card } from "@/components/ui";
import { LabPill } from "@/components/visit-pills";
import { labLabel } from "@/lib/labels";
import { useStore } from "@/lib/store";
import type { LabStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { FlaskConical, Package, PackageCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function LabsPage() {
  const { visits, settings } = useStore();
  const router = useRouter();
  const labs = visits.filter((v) => v.resultPath === "lab");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [carrier, setCarrier] = useState("all");
  const [location, setLocation] = useState("all");

  const due = labs.filter(
    (v) => v.expectedDeliveryAt && !v.deliveredAt && new Date(v.expectedDeliveryAt).getTime() <= Date.now(),
  );
  const stats = [
    { label: "Shipments", value: String(labs.length), hint: "Specimens", icon: FlaskConical, tint: "from-blue-500 to-sky-400" },
    { label: "Queued", value: String(labs.filter((v) => v.labStatus === "queued").length), hint: "Not shipped", icon: Package, tint: "from-indigo-500 to-blue-400" },
    { label: "In transit", value: String(labs.filter((v) => v.labStatus === "shipped" || v.labStatus === "expected").length), hint: "On the way", icon: Truck, tint: "from-sky-500 to-cyan-400" },
    { label: "Due / delivered", value: String(due.length + labs.filter((v) => v.labStatus === "delivered" || v.labStatus === "results_in").length), hint: `${due.length} due now`, icon: PackageCheck, tint: "from-amber-500 to-orange-400" },
  ];

  const carriers = Array.from(new Set(labs.map((v) => v.carrier).filter(Boolean))) as string[];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return labs.filter((v) => {
      if (term && !`${v.visitNumber} ${v.firstName} ${v.lastName} ${v.trackingNumber ?? ""}`.toLowerCase().includes(term)) {
        return false;
      }
      if (status !== "all" && v.labStatus !== status) return false;
      if (carrier !== "all" && v.carrier !== carrier) return false;
      if (location !== "all" && v.location !== location) return false;
      return true;
    });
  }, [labs, q, status, carrier, location]);

  return (
    <AppShell>
      <h1 className="mb-1 text-[22px] font-semibold tracking-tight text-slate-950">Shipments</h1>
      <p className="mb-3 text-sm text-slate-500">Specimens in transit, due today, or waiting on results.</p>
      <StatRow items={stats} />
      <FilterBar>
        <FilterSearch value={q} onChange={setQ} placeholder="Search visit, name, or tracking #" />
        <select className={filterClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All lab statuses</option>
          {(Object.keys(labLabel) as LabStatus[])
            .filter((key) => key !== "not_required")
            .map((key) => (
              <option key={key} value={key}>
                {labLabel[key]}
              </option>
            ))}
        </select>
        <select className={filterClass} value={carrier} onChange={(e) => setCarrier(e.target.value)}>
          <option value="all">All carriers</option>
          {carriers.map((c) => (
            <option key={c}>{c}</option>
          ))}
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
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] font-medium text-slate-500">
            <tr className="border-b border-blue-50">
              <th className="px-4 py-2">Visit</th>
              <th className="px-4 py-2">Visitor</th>
              <th className="px-4 py-2">Carrier</th>
              <th className="px-4 py-2">Tracking</th>
              <th className="px-4 py-2">Expected</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((visit) => (
              <tr
                key={visit.id}
                className="relative cursor-pointer border-b border-slate-50 hover:bg-blue-50/40"
                onClick={() => router.push(`/visits/${visit.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/visits/${visit.id}`);
                  }
                }}
                tabIndex={0}
              >
                <td className="relative px-4 py-2.5">
                  <Link
                    href={`/visits/${visit.id}`}
                    className="absolute inset-0 z-10"
                    aria-label={`Open visit ${visit.visitNumber}`}
                  />
                  <p className="relative font-medium text-zinc-950">{visit.visitNumber}</p>
                </td>
                <td className="px-4 py-2.5">
                  {visit.firstName} {visit.lastName}
                </td>
                <td className="px-4 py-2.5">{visit.carrier ?? "—"}</td>
                <td className="px-4 py-2.5">{visit.trackingNumber ?? "—"}</td>
                <td className="px-4 py-2.5">
                  {visit.expectedDeliveryAt ? formatDate(visit.expectedDeliveryAt) : "—"}
                </td>
                <td className="px-4 py-2.5">
                  <LabPill visit={visit} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
