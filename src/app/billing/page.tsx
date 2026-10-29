"use client";

import { FilterBar, FilterSearch, StatRow, filterClass } from "@/components/module-chrome";
import { AppShell } from "@/components/shell";
import { Card } from "@/components/ui";
import { VisitTable } from "@/components/visit-table";
import { billingLabel } from "@/lib/labels";
import { useStore } from "@/lib/store";
import type { BillingStatus } from "@/lib/types";
import { money } from "@/lib/utils";
import { AlertTriangle, Banknote, FileText, Zap } from "lucide-react";
import { useMemo, useState } from "react";

export default function BillingPage() {
  const { visits, settings } = useStore();
  const [q, setQ] = useState("");
  const [model, setModel] = useState("all");
  const [status, setStatus] = useState("open");
  const [location, setLocation] = useState("all");

  const collected = visits.filter((v) => v.billingStatus === "paid").reduce((s, v) => s + v.amount, 0);

  const stats = [
    {
      label: "Needs approval",
      value: String(visits.filter((v) => v.billingStatus === "payment_received").length),
      hint: "QuickBooks payment in",
      icon: Zap,
      tint: "from-violet-500 to-indigo-400",
    },
    {
      label: "Open invoices",
      value: String(visits.filter((v) => v.billingStatus === "invoiced").length),
      hint: "Waiting on payment",
      icon: FileText,
      tint: "from-blue-500 to-sky-400",
    },
    {
      label: "Overdue",
      value: String(visits.filter((v) => v.billingStatus === "overdue").length),
      hint: "Past due date",
      icon: AlertTriangle,
      tint: "from-rose-500 to-orange-400",
    },
    {
      label: "Collected",
      value: money(collected),
      hint: "Approved payments",
      icon: Banknote,
      tint: "from-emerald-500 to-teal-400",
    },
  ];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const open = ["overdue", "invoiced", "payment_received"];
    return visits.filter((v) => {
      if (term && !`${v.visitNumber} ${v.firstName} ${v.lastName} ${v.payerName} ${v.invoiceNumber ?? ""}`.toLowerCase().includes(term)) {
        return false;
      }
      if (model !== "all" && v.paymentModel !== model) return false;
      if (status === "open" && !open.includes(v.billingStatus)) return false;
      if (status !== "all" && status !== "open" && v.billingStatus !== status) return false;
      if (location !== "all" && v.location !== location) return false;
      return true;
    });
  }, [visits, q, model, status, location]);

  return (
    <AppShell>
      <h1 className="mb-1 text-[22px] font-semibold tracking-tight text-slate-950">Billing</h1>
      <p className="mb-3 text-sm text-slate-500">QuickBooks is the money source of truth. Connect it in Settings.</p>
      <StatRow items={stats} />
      <FilterBar>
        <FilterSearch value={q} onChange={setQ} placeholder="Search visit, payer, or invoice #" />
        <select className={filterClass} value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="all">All payment models</option>
          <option value="trigger">Trigger pay</option>
          <option value="invoice">Invoice</option>
          <option value="self_pay">Self-pay</option>
        </select>
        <select className={filterClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="open">Open balances</option>
          <option value="all">All statuses</option>
          {(Object.keys(billingLabel) as BillingStatus[]).map((key) => (
            <option key={key} value={key}>
              {billingLabel[key]}
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
      <Card>
        <VisitTable visits={filtered} compact />
      </Card>
    </AppShell>
  );
}
