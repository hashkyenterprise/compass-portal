"use client";

import { FilterBar, FilterSearch, StatRow, filterClass } from "@/components/module-chrome";
import { AppShell } from "@/components/shell";
import { Card } from "@/components/ui";
import { resultLabel } from "@/lib/labels";
import { applyResultStatus, useStore } from "@/lib/store";
import type { ResultDeliveryStatus } from "@/lib/types";
import { FileCheck, FileWarning, Mail, Send } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function ResultsPage() {
  const { visits, updateVisit, settings } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [location, setLocation] = useState("all");

  const stats = [
    { label: "Need PDF", value: String(visits.filter((v) => v.resultDeliveryStatus === "not_ready").length), hint: "No file yet", icon: FileWarning, tint: "from-slate-500 to-slate-400" },
    { label: "PDF on file", value: String(visits.filter((v) => v.resultDeliveryStatus === "attached").length), hint: "Ready to draft", icon: FileCheck, tint: "from-blue-500 to-sky-400" },
    { label: "Draft ready", value: String(visits.filter((v) => v.resultDeliveryStatus === "drafted").length), hint: "Waiting to send", icon: Mail, tint: "from-indigo-500 to-blue-400" },
    { label: "Email sent", value: String(visits.filter((v) => v.resultDeliveryStatus === "sent").length), hint: "Delivered to client", icon: Send, tint: "from-emerald-500 to-teal-400" },
  ];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return visits.filter((v) => {
      if (
        term &&
        !`${v.visitNumber} ${v.firstName} ${v.lastName} ${v.payerEmail} ${v.draftSubject ?? ""}`.toLowerCase().includes(term)
      ) {
        return false;
      }
      if (status !== "all" && v.resultDeliveryStatus !== status) return false;
      if (location !== "all" && v.location !== location) return false;
      return true;
    });
  }, [visits, q, status, location]);

  function setStatusFor(id: string, next: ResultDeliveryStatus) {
    const visit = visits.find((v) => v.id === id);
    if (!visit) return;
    updateVisit(id, applyResultStatus(visit, next, settings), `Results status set to ${resultLabel[next]}.`);
  }

  return (
    <AppShell>
      <h1 className="mb-1 text-[22px] font-semibold tracking-tight text-slate-950">Results</h1>
      <p className="mb-3 text-sm text-slate-500">View the result and set status. Open a visit to send the draft email.</p>
      <StatRow items={stats} />
      <FilterBar>
        <FilterSearch value={q} onChange={setQ} placeholder="Search visit, name, or recipient" />
        <select className={filterClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {(Object.keys(resultLabel) as ResultDeliveryStatus[]).map((key) => (
            <option key={key} value={key}>
              {resultLabel[key]}
            </option>
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
              <th className="px-4 py-2">Result</th>
              <th className="px-4 py-2">Send to</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((visit) => {
              const recipient = visit.sentTo || (visit.payerEmail !== "N/A" ? visit.payerEmail : visit.email);
              return (
                <tr key={visit.id} className="border-b border-slate-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/visits/${visit.id}`} className="font-medium text-zinc-950 hover:text-blue-700">
                      {visit.visitNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    {visit.firstName} {visit.lastName}
                  </td>
                  <td className="px-4 py-2.5">{visit.resultFileName ?? "—"}</td>
                  <td className="px-4 py-2.5">{recipient}</td>
                  <td className="px-4 py-2.5">
                    <select
                      className={filterClass}
                      value={visit.resultDeliveryStatus}
                      onChange={(e) => setStatusFor(visit.id, e.target.value as ResultDeliveryStatus)}
                    >
                      {(Object.keys(resultLabel) as ResultDeliveryStatus[]).map((key) => (
                        <option key={key} value={key}>
                          {resultLabel[key]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No results match these filters.</p> : null}
      </Card>
    </AppShell>
  );
}
