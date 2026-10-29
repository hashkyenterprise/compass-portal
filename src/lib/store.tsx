"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearResultFiles } from "./attachments";
import { hydrateVisitServices, servicesTotal } from "./catalog";
import { defaultSettings } from "./defaults";
import { resultsEmail } from "./email";
import { DEMO_PASSWORD, seedState } from "./seed";
import type { AppState, BillingStatus, ResultDeliveryStatus, Settings, StaffUser, Visit } from "./types";
import { addDays, invoiceNumberFor, isOverdue, uid } from "./utils";

const STORAGE_KEY = "compass-portal-v2";

type Store = AppState & {
  hydrated: boolean;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  createVisit: (
    input: Omit<
      Visit,
      | "id"
      | "visitNumber"
      | "audit"
      | "stage"
      | "billingStatus"
      | "labStatus"
      | "resultDeliveryStatus"
      | "dueDate"
      | "createdAt"
    >,
  ) => Visit;
  updateVisit: (id: string, patch: Partial<Visit>, message?: string) => void;
  addStaff: (user: Omit<StaffUser, "id">) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetDemo: () => void;
};

const Ctx = createContext<Store | null>(null);

function nextVisitNumber(visits: Visit[]) {
  const nums = visits.map((v) => Number(v.visitNumber.split("-")[1] || 0));
  const max = nums.length ? Math.max(...nums) : 10400;
  return `CDS-${max + 1}`;
}

function withAudit(visit: Visit, actor: string, message: string): Visit {
  return {
    ...visit,
    audit: [
      { id: uid("aud"), at: new Date().toISOString(), actor, message },
      ...visit.audit,
    ],
  };
}

function normalizeBillingStatus(status: string): BillingStatus {
  if (status === "paid" || status === "trigger_matched") return "paid";
  if (status === "payment_received") return "payment_received";
  if (status === "overdue") return "overdue";
  return "invoiced";
}

function refreshBilling(visit: Visit): Visit {
  const billingStatus = normalizeBillingStatus(visit.billingStatus);
  const invoiceNumber = visit.invoiceNumber || invoiceNumberFor(visit.visitNumber);
  const next = { ...visit, billingStatus, invoiceNumber };
  if (next.billingStatus === "paid" || next.billingStatus === "payment_received") {
    return next;
  }
  if (isOverdue(next.dueDate, next.billingStatus)) {
    return { ...next, billingStatus: "overdue" };
  }
  return next;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(seedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AppState;
        setState({
          ...seedState,
          ...parsed,
          settings: {
            ...defaultSettings,
            ...parsed.settings,
            services: parsed.settings?.services?.length ? parsed.settings.services : defaultSettings.services,
            locations: parsed.settings?.locations?.length ? parsed.settings.locations : defaultSettings.locations,
          },
          visits: (parsed.visits ?? seedState.visits).map((visit) => {
            const next = refreshBilling(hydrateVisitServices(visit));
            if (
              (next.resultDeliveryStatus === "sent" || next.resultDeliveryStatus === "drafted") &&
              !next.draftBody
            ) {
              return {
                ...next,
                ...applyResultStatus(next, next.resultDeliveryStatus, {
                  ...defaultSettings,
                  ...parsed.settings,
                }),
              };
            }
            return next;
          }),
        });
      } catch {
        setState(seedState);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const api = useMemo<Store>(() => {
    const actor = state.currentUser?.name ?? "Staff";

    return {
      ...state,
      hydrated,
      login: (email, password) => {
        if (password !== DEMO_PASSWORD) return "Wrong password. Use Compass2026!";
        const user = state.users.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
        );
        if (!user) return "No staff account for that email.";
        setState((s) => ({ ...s, currentUser: user }));
        return null;
      },
      logout: () => setState((s) => ({ ...s, currentUser: null })),
      resetDemo: () => {
        localStorage.removeItem(STORAGE_KEY);
        void clearResultFiles();
        setState({ ...seedState, currentUser: state.currentUser });
      },
      addStaff: (user) => {
        setState((s) => ({
          ...s,
          users: [...s.users, { ...user, id: uid("u") }],
        }));
      },
      updateSettings: (patch) => {
        setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
      },
      createVisit: (input) => {
        const createdAt = new Date().toISOString();
        const dueDate = addDays(createdAt, input.netTermsDays);
        const visitNumber = nextVisitNumber(state.visits);
        const invoiceNumber = invoiceNumberFor(visitNumber);

        const serviceLines = input.serviceLines?.length
          ? input.serviceLines
          : [{ id: "legacy", name: input.service, price: input.amount }];
        const visit: Visit = {
          ...input,
          serviceLines,
          service: serviceLines.map((line) => line.name).join(" · "),
          amount: input.amount || servicesTotal(serviceLines),
          id: uid("vis"),
          visitNumber,
          createdAt,
          dueDate,
          invoiceNumber,
          billingStatus: "invoiced",
          labStatus: input.resultPath === "lab" ? "queued" : "not_required",
          resultDeliveryStatus: "not_ready",
          stage: "checked_in",
          audit: [
            {
              id: uid("aud"),
              at: createdAt,
              actor,
              message: "Visitor registered in portal.",
            },
            {
              id: uid("aud"),
              at: createdAt,
              actor: "System",
              message: `Invoice ${invoiceNumber} created for ${input.paymentModel === "trigger" ? "trigger pay" : input.paymentModel === "self_pay" ? "self-pay" : "net terms"}.`,
            },
          ],
        };
        setState((s) => ({ ...s, visits: [visit, ...s.visits] }));
        return visit;
      },
      updateVisit: (id, patch, message) => {
        setState((s) => ({
          ...s,
          visits: s.visits.map((visit) => {
            if (visit.id !== id) return visit;
            const next = hydrateVisitServices({ ...visit, ...patch });
            return message ? withAudit(next, actor, message) : next;
          }),
        }));
      },
    };
  }, [state, hydrated]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function visitExceptions(visits: Visit[]) {
  return {
    missingResults: visits.filter(
      (v) =>
        v.stage !== "closed" &&
        v.resultDeliveryStatus !== "sent" &&
        (v.resultPath === "lab"
          ? v.labStatus === "delivered" || v.labStatus === "results_in"
          : v.stage !== "checked_in"),
    ),
    unbilled: visits.filter((v) => v.billingStatus === "payment_received"),
    unpaid: visits.filter((v) => v.billingStatus === "invoiced" || v.billingStatus === "overdue"),
    overdue: visits.filter((v) => v.billingStatus === "overdue"),
    labDue: visits.filter(
      (v) =>
        v.resultPath === "lab" &&
        v.expectedDeliveryAt &&
        !v.deliveredAt &&
        new Date(v.expectedDeliveryAt).getTime() <= Date.now(),
    ),
    drafts: visits.filter((v) => v.resultDeliveryStatus === "drafted"),
  };
}

export function applyDraft(visit: Visit, settings: Settings = defaultSettings): Partial<Visit> {
  return applyResultStatus(visit, "drafted", settings);
}

export function applyResultStatus(
  visit: Visit,
  status: ResultDeliveryStatus,
  settings: Settings = defaultSettings,
): Partial<Visit> {
  const now = new Date().toISOString();
  const email = resultsEmail(visit, settings);
  const patch: Partial<Visit> = { resultDeliveryStatus: status };

  if (status === "drafted" || status === "sent") {
    patch.draftSubject = visit.draftSubject || email.subject;
    patch.draftBody = visit.draftBody || email.body;
    patch.sentTo = visit.sentTo || email.recipient;
    if (status === "drafted") patch.draftedAt = visit.draftedAt || now;
    if (status === "sent") {
      patch.sentAt = visit.sentAt || now;
      patch.stage = "results_delivered";
    }
  }

  return patch;
}
