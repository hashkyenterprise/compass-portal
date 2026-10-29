import type { CatalogLocation, CatalogService, Visit, VisitServiceLine } from "./types";

export const defaultCatalogServices: CatalogService[] = [
  { id: "svc_drug", name: "Drug and/or Alcohol Screening", price: 45 },
  { id: "svc_dna", name: "DNA/Relationship Testing", price: 375 },
  { id: "svc_prints", name: "Fingerprint/Background Screening", price: 65 },
  { id: "svc_phleb", name: "Phlebotomy/Blood Draw", price: 85 },
  { id: "svc_physical", name: "Physical/Medical Exam", price: 95 },
  { id: "svc_prenatal", name: "Prenatal Testing", price: 125 },
  { id: "svc_passport", name: "Passport Photo", price: 20 },
];

export const defaultCatalogLocations: CatalogLocation[] = [
  { id: "loc_mh", name: "Muskegon Heights" },
  { id: "loc_clare", name: "Clare" },
  { id: "loc_gladwin", name: "Gladwin" },
  { id: "loc_harrison", name: "Harrison" },
  { id: "loc_mtp", name: "Mt. Pleasant" },
  { id: "loc_midland", name: "Midland" },
  { id: "loc_mobile", name: "Mobile / on-site" },
];

export function serviceLinesOf(visit: Visit): VisitServiceLine[] {
  if (visit.serviceLines?.length) return visit.serviceLines;
  return [{ id: "legacy", name: visit.service, price: visit.amount }];
}

export function serviceLabel(visit: Visit) {
  return serviceLinesOf(visit)
    .map((line) => line.name)
    .join(" · ");
}

export function servicesTotal(lines: VisitServiceLine[]) {
  return lines.reduce((sum, line) => sum + Number(line.price || 0), 0);
}

export function visitHasService(visit: Visit, name: string) {
  return serviceLinesOf(visit).some((line) => line.name === name);
}

export function hydrateVisitServices(visit: Visit): Visit {
  const serviceLines = serviceLinesOf(visit);
  return {
    ...visit,
    serviceLines,
    service: serviceLines.map((line) => line.name).join(" · "),
  };
}
