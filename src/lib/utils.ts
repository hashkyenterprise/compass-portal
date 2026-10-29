export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Detroit",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Detroit",
  }).format(new Date(iso));
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function isOverdue(dueDate: string, billingStatus: string) {
  if (billingStatus === "paid" || billingStatus === "payment_received") return false;
  return new Date(dueDate).getTime() < Date.now();
}

export function invoiceNumberFor(visitNumber: string) {
  const n = visitNumber.split("-")[1] ?? visitNumber;
  return `INV-${n}`;
}

export function isPaidStatus(status: string) {
  return status === "paid";
}

export function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
