import type {
  BillingStatus,
  LabStatus,
  ResultDeliveryStatus,
  ResultPath,
  VisitStage,
} from "./types";

export const services = [
  "Drug and/or Alcohol Screening",
  "DNA/Relationship Testing",
  "Fingerprint/Background Screening",
  "Phlebotomy/Blood Draw",
  "Physical/Medical Exam",
  "Prenatal Testing",
  "Passport Photo",
  "Other",
] as const;

export const locations = [
  "Muskegon Heights",
  "Clare",
  "Gladwin",
  "Harrison",
  "Mt. Pleasant",
  "Midland",
  "Mobile / on-site",
] as const;

export const stageLabel: Record<VisitStage, string> = {
  checked_in: "Checked in",
  in_service: "In service",
  same_day_complete: "Service complete",
  awaiting_lab: "Awaiting lab",
  results_ready: "Results ready",
  results_delivered: "Results sent",
  closed: "Closed",
};

export const billingLabel: Record<BillingStatus, string> = {
  invoiced: "Invoice open",
  overdue: "Overdue",
  payment_received: "Needs approval",
  paid: "Paid",
};

export const labLabel: Record<LabStatus, string> = {
  not_required: "Not required",
  queued: "Queued",
  shipped: "Shipped",
  expected: "Expected today",
  delivered: "Delivered",
  results_in: "Lab results in",
};

export const resultLabel: Record<ResultDeliveryStatus, string> = {
  not_ready: "Need PDF",
  attached: "PDF on file",
  drafted: "Draft ready",
  sent: "Email sent",
  blocked: "Blocked",
};

export const pathLabel: Record<ResultPath, string> = {
  same_day: "Same-day results",
  lab: "Send to lab",
};
