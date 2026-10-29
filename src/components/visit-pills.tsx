import { billingLabel, labLabel, resultLabel, stageLabel } from "@/lib/labels";
import type { Visit } from "@/lib/types";
import { StatusPill } from "./ui";

export function StagePill({ visit }: { visit: Visit }) {
  const tone =
    visit.stage === "results_delivered" || visit.stage === "closed"
      ? "green"
      : visit.stage === "awaiting_lab"
        ? "gold"
        : visit.stage === "results_ready"
          ? "violet"
          : "blue";
  return <StatusPill tone={tone}>{stageLabel[visit.stage]}</StatusPill>;
}

export function BillingPill({ visit }: { visit: Visit }) {
  const tone =
    visit.billingStatus === "paid"
      ? "green"
      : visit.billingStatus === "overdue"
        ? "red"
        : visit.billingStatus === "payment_received"
          ? "violet"
          : "gold";
  return <StatusPill tone={tone}>{billingLabel[visit.billingStatus]}</StatusPill>;
}

export function LabPill({ visit }: { visit: Visit }) {
  const tone =
    visit.labStatus === "results_in" || visit.labStatus === "delivered"
      ? "green"
      : visit.labStatus === "shipped" || visit.labStatus === "expected"
        ? "blue"
        : visit.labStatus === "queued"
          ? "gold"
          : "slate";
  return <StatusPill tone={tone}>{labLabel[visit.labStatus]}</StatusPill>;
}

export function ResultPill({ visit }: { visit: Visit }) {
  const tone =
    visit.resultDeliveryStatus === "sent"
      ? "green"
      : visit.resultDeliveryStatus === "drafted"
        ? "violet"
        : visit.resultDeliveryStatus === "blocked"
          ? "red"
          : "slate";
  return <StatusPill tone={tone}>{resultLabel[visit.resultDeliveryStatus]}</StatusPill>;
}
