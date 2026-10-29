import { serviceLabel } from "./catalog";
import { defaultSettings } from "./defaults";
import type { Settings, Visit } from "./types";

export function resultsEmail(visit: Visit, settings: Settings = defaultSettings) {
  const recipient =
    visit.payerEmail && visit.payerEmail.toUpperCase() !== "N/A"
      ? visit.payerEmail
      : visit.email;

  const tokens: Record<string, string> = {
    firstName: visit.firstName,
    lastName: visit.lastName,
    fullName: `${visit.firstName} ${visit.lastName}`,
    visitNumber: visit.visitNumber,
    service: serviceLabel(visit),
    visitDate: new Date(visit.createdAt).toLocaleDateString("en-US"),
    attachment: visit.resultFileName || "pending",
    clinicName: settings.clinicName,
    clinicAddress: settings.clinicAddress,
    clinicPhone: settings.clinicPhone,
  };

  const fill = (template: string) =>
    template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => tokens[key] ?? "");

  return {
    recipient,
    subject: fill(settings.resultsSubject),
    body: fill(settings.resultsBody),
  };
}
