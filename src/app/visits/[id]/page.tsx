"use client";

import { AppShell } from "@/components/shell";
import { Card, Field, GhostButton, PrimaryButton, inputClass } from "@/components/ui";
import { BillingPill, LabPill, ResultPill, StagePill } from "@/components/visit-pills";
import { getResultFile, isPdfFile, saveResultFile } from "@/lib/attachments";
import { resultsEmail } from "@/lib/email";
import { intakeCopy } from "@/lib/intake";
import { serviceLabel, serviceLinesOf, servicesTotal } from "@/lib/catalog";
import { billingLabel, labLabel, resultLabel, stageLabel } from "@/lib/labels";
import { ResultEmailPreview } from "@/components/result-email";
import { ServiceChecklist } from "@/components/service-checklist";
import { applyResultStatus, useStore } from "@/lib/store";
import type { BillingStatus, LabStatus, ResultDeliveryStatus, Visit, VisitStage } from "@/lib/types";
import { cn, formatBytes, formatDate, formatDateTime, money } from "@/lib/utils";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";

type VisitTab = "status" | "visitor" | "shipment" | "results" | "billing" | "log";

export default function VisitDetailPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <p className="text-sm text-slate-500">Loading visit…</p>
        </AppShell>
      }
    >
      <VisitDetailInner />
    </Suspense>
  );
}

function VisitDetailInner() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const editing = searchParams.get("edit") === "1";
  const { visits, updateVisit, settings } = useStore();
  const visit = visits.find((v) => v.id === id);
  const [carrier, setCarrier] = useState("FedEx");
  const [tracking, setTracking] = useState("");
  const [expected, setExpected] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileBusy, setFileBusy] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [tab, setTab] = useState<VisitTab>(editing ? "visitor" : "status");
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [shipStatus, setShipStatus] = useState<LabStatus>("shipped");
  const [editServiceIds, setEditServiceIds] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!visit) return;
    setCarrier(visit.carrier || "FedEx");
    setTracking(visit.trackingNumber || "");
    setExpected(visit.expectedDeliveryAt ? visit.expectedDeliveryAt.slice(0, 10) : "");
    setShipStatus(visit.labStatus === "not_required" ? "shipped" : visit.labStatus);
    const matched = settings.services
      .filter((item) => serviceLinesOf(visit).some((line) => line.id === item.id || line.name === item.name))
      .map((item) => item.id);
    setEditServiceIds(matched);
  }, [visit?.id, settings.services]);

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    if (!id) return;
    void getResultFile(id).then((file) => {
      if (cancelled) return;
      if (!file) {
        setFileUrl(null);
        return;
      }
      url = URL.createObjectURL(file.blob);
      setFileUrl(url);
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id, visit?.resultAttachedAt, visit?.resultFileStored]);

  useEffect(() => {
    if (editing) setTab("visitor");
  }, [editing]);

  if (!visit) {
    return (
      <AppShell>
        <p>Visit not found.</p>
      </AppShell>
    );
  }

  const record = visit;
  const hasPdf = Boolean(visit.resultFileStored || fileUrl);
  const resultMail = resultsEmail(visit, settings);

  function setStage(stage: VisitStage) {
    updateVisit(record.id, { stage }, `Stage set to ${stageLabel[stage]}.`);
  }

  function setLabStatus(labStatus: LabStatus) {
    const now = new Date().toISOString();
    const patch: Partial<Visit> = { labStatus };
    if (labStatus === "shipped" || labStatus === "expected") {
      patch.stage = record.stage === "checked_in" || record.stage === "in_service" ? "awaiting_lab" : record.stage;
      patch.shippedAt = record.shippedAt || now;
      if (carrier) patch.carrier = carrier;
      if (tracking) patch.trackingNumber = tracking;
      if (expected) patch.expectedDeliveryAt = new Date(expected).toISOString();
    }
    if (labStatus === "delivered") patch.deliveredAt = record.deliveredAt || now;
    if (labStatus === "results_in") {
      patch.deliveredAt = record.deliveredAt || now;
      if (record.stage !== "results_delivered" && record.stage !== "closed") patch.stage = "results_ready";
    }
    updateVisit(record.id, patch, `Lab status set to ${labLabel[labStatus]}.`);
  }

  function setResultStatus(resultDeliveryStatus: ResultDeliveryStatus) {
    if (resultDeliveryStatus === "attached" && !record.resultFileStored) {
      fileRef.current?.click();
      return;
    }
    updateVisit(
      record.id,
      applyResultStatus(record, resultDeliveryStatus, settings),
      `Results status set to ${resultLabel[resultDeliveryStatus]}.`,
    );
  }

  function sendDraftEmail() {
    updateVisit(
      record.id,
      applyResultStatus(record, "sent", settings),
      `Draft email sent to ${record.sentTo || resultMail.recipient}.`,
    );
  }

  function setBillingStatus(billingStatus: BillingStatus) {
    const now = new Date().toISOString();
    const patch: Partial<Visit> = { billingStatus };
    if (billingStatus === "paid") {
      patch.paidAt = record.paidAt || now;
    }
    if (billingStatus === "payment_received" && !record.quickbooksRef) {
      patch.quickbooksRef = `QB-${Math.floor(8000 + Math.random() * 900)}`;
    }
    updateVisit(record.id, patch, `Invoice status set to ${billingLabel[billingStatus]}.`);
  }

  function startCreateShipment() {
    setCreatingShipment(true);
    setShipStatus("shipped");
    if (!expected) {
      const next = new Date();
      next.setDate(next.getDate() + 1);
      setExpected(next.toISOString().slice(0, 10));
    }
  }

  function saveShipment() {
    if (!tracking.trim() || !expected) return;
    const now = new Date().toISOString();
    const patch: Partial<Visit> = {
      carrier,
      trackingNumber: tracking.trim(),
      expectedDeliveryAt: new Date(expected).toISOString(),
      labStatus: shipStatus,
    };
    if (shipStatus !== "queued") {
      patch.shippedAt = record.shippedAt || now;
    }
    if (shipStatus === "shipped" || shipStatus === "expected") {
      patch.stage =
        record.stage === "checked_in" || record.stage === "in_service" ? "awaiting_lab" : record.stage;
    }
    if (shipStatus === "delivered" || shipStatus === "results_in") {
      patch.deliveredAt = record.deliveredAt || now;
    }
    updateVisit(record.id, patch);
    setCreatingShipment(false);
  }

  async function onPickFile(file: File | undefined) {
    if (!file) return;
    setFileError(null);
    if (!isPdfFile(file)) {
      setFileError("Please choose a PDF file.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setFileError("PDF must be 25 MB or smaller.");
      return;
    }
    setFileBusy(true);
    try {
      const saved = await saveResultFile(record.id, file);
      updateVisit(
        record.id,
        {
          resultFileName: saved.name,
          resultFileStored: true,
          resultFileSize: saved.size,
          resultAttachedAt: new Date().toISOString(),
          resultDeliveryStatus: "attached",
          labStatus: record.resultPath === "lab" ? "results_in" : record.labStatus,
          stage: "results_ready",
        },
        `Result PDF uploaded: ${saved.name}`,
      );
    } catch {
      setFileError("Could not save that PDF. Try again.");
    } finally {
      setFileBusy(false);
    }
  }

  function markQbReceived() {
    const ref = record.quickbooksRef || `QB-${Math.floor(8000 + Math.random() * 900)}`;
    updateVisit(
      record.id,
      { billingStatus: "payment_received", quickbooksRef: ref },
      `QuickBooks reports payment received (${ref}). Waiting for approval.`,
    );
  }

  function approvePayment() {
    updateVisit(
      record.id,
      { billingStatus: "paid", paidAt: new Date().toISOString() },
      `Payment approved. Invoice ${record.invoiceNumber} marked paid.`,
    );
  }

  function onSaveEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    updateVisit(
      record.id,
      {
        firstName: String(form.get("firstName")),
        lastName: String(form.get("lastName")),
        phone: String(form.get("phone")),
        email: String(form.get("email")),
        location: String(form.get("location")),
        payerName: String(form.get("payerName")),
        payerEmail: String(form.get("payerEmail")),
        payerPhone: String(form.get("payerPhone")),
        serviceLines: settings.services.filter((item) => editServiceIds.includes(item.id)),
        service: settings.services
          .filter((item) => editServiceIds.includes(item.id))
          .map((item) => item.name)
          .join(" · "),
        amount: servicesTotal(settings.services.filter((item) => editServiceIds.includes(item.id))),
      },
      "Visit details updated.",
    );
    router.replace(`/visits/${record.id}`);
  }

  const tabs: Array<{ id: VisitTab; label: string; alert?: boolean }> = [
    { id: "status", label: "Status" },
    { id: "visitor", label: "Visitor" },
    { id: "shipment", label: "Shipment" },
    { id: "results", label: "Results" },
    { id: "billing", label: "Billing", alert: visit.billingStatus === "payment_received" },
    { id: "log", label: "Log" },
  ];

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-3">
        <Link href="/visits" className="text-xs font-semibold text-blue-700 dark:text-blue-300">
          ← All visits
        </Link>
        <Link
          href={`/visits/${visit.id}?edit=1`}
          onClick={() => setTab("visitor")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300"
        >
          <Pencil size={12} /> Edit
        </Link>
      </div>

      <Card className="mt-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              {visit.visitNumber} · {visit.location}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {visit.firstName} {visit.lastName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{serviceLabel(visit)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StagePill visit={visit} />
            <LabPill visit={visit} />
            <ResultPill visit={visit} />
            <BillingPill visit={visit} />
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Invoice</p>
            <p className="mt-0.5 text-sm font-semibold">{visit.invoiceNumber}</p>
            <p className="text-xs text-slate-500">{money(visit.amount)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Payer</p>
            <p className="mt-0.5 truncate text-sm font-semibold">{visit.payerName}</p>
            <p className="truncate text-xs text-slate-500">{visit.payerEmail}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Shipment</p>
            <p className="mt-0.5 text-sm font-semibold">{labLabel[visit.labStatus]}</p>
            <p className="truncate text-xs text-slate-500">{visit.trackingNumber ?? "No tracking yet"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Results</p>
            <p className="mt-0.5 text-sm font-semibold">{resultLabel[visit.resultDeliveryStatus]}</p>
            <p className="truncate text-xs text-slate-500">{visit.resultPath === "lab" ? "Lab path" : "Same-day"}</p>
          </div>
        </div>
      </Card>

      <div className="mt-3 flex flex-wrap gap-1 rounded-2xl border border-blue-100 bg-white/80 p-1 dark:border-slate-700 dark:bg-slate-900/80">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-xl px-3 py-1.5 text-[13px] font-semibold transition",
              tab === item.id
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-800",
            )}
          >
            {item.label}
            {item.alert ? <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-300" /> : null}
          </button>
        ))}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void onPickFile(file);
        }}
      />

      <Card className="mt-3 p-5">
        {tab === "status" ? (
          <div>
            <p className="mb-3 text-sm font-semibold">Status</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Visit stage">
                <select className={inputClass} value={visit.stage} onChange={(e) => setStage(e.target.value as VisitStage)}>
                  {(Object.keys(stageLabel) as VisitStage[]).map((key) => (
                    <option key={key} value={key}>
                      {stageLabel[key]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Shipment / lab">
                <select className={inputClass} value={visit.labStatus} onChange={(e) => setLabStatus(e.target.value as LabStatus)}>
                  {(Object.keys(labLabel) as LabStatus[]).map((key) => (
                    <option key={key} value={key}>
                      {labLabel[key]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Results">
                <select
                  className={inputClass}
                  value={visit.resultDeliveryStatus}
                  onChange={(e) => setResultStatus(e.target.value as ResultDeliveryStatus)}
                >
                  {(Object.keys(resultLabel) as ResultDeliveryStatus[]).map((key) => (
                    <option key={key} value={key}>
                      {resultLabel[key]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Invoice">
                <select
                  className={inputClass}
                  value={visit.billingStatus}
                  onChange={(e) => setBillingStatus(e.target.value as BillingStatus)}
                >
                  {(Object.keys(billingLabel) as BillingStatus[]).map((key) => (
                    <option key={key} value={key}>
                      {billingLabel[key]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        ) : null}

        {tab === "visitor" ? (
          <div className="space-y-5">
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <p>
                <span className="text-slate-400">Phone</span>
                <br />
                {visit.phone}
              </p>
              <p>
                <span className="text-slate-400">Email</span>
                <br />
                {visit.email}
              </p>
              <p className="md:col-span-2">
                <span className="text-slate-400">Services</span>
                <br />
                {serviceLinesOf(visit).map((line) => (
                  <span key={line.id} className="mr-2 mt-1 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-slate-800 dark:text-blue-200">
                    {line.name} · {money(line.price)}
                  </span>
                ))}
              </p>
              <p>
                <span className="text-slate-400">Company or Agency name to send results to</span>
                <br />
                {visit.payerName}
              </p>
              <p>
                <span className="text-slate-400">Company or Agency email</span>
                <br />
                {visit.payerEmail}
              </p>
              <p>
                <span className="text-slate-400">Company or Agency phone</span>
                <br />
                {visit.payerPhone}
              </p>
            </div>
            <div className="grid gap-3 text-sm md:grid-cols-2">
              {[
                [intakeCopy.optInTitle, visit.optInElectronic, intakeCopy.optInChoice],
                [intakeCopy.thirdPartyTitle, visit.thirdPartyAuth, intakeCopy.understand],
                [intakeCopy.identityTitle, visit.identityAck, intakeCopy.understand],
                [intakeCopy.diagnosisTitle, visit.noDiagnosisAck, intakeCopy.understand],
              ].map(([title, ok, choice]) => (
                <div key={String(title)} className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/70">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{title}</p>
                  <p className="mt-1 font-medium">{ok ? choice : "Not confirmed"}</p>
                </div>
              ))}
            </div>
            <form onSubmit={onSaveEdit} className="grid gap-3 border-t border-blue-50 pt-4 md:grid-cols-2 xl:grid-cols-3 dark:border-slate-800">
              <Field label="First Name" required>
                <input name="firstName" required defaultValue={visit.firstName} className={inputClass} />
              </Field>
              <Field label="Last Name" required>
                <input name="lastName" required defaultValue={visit.lastName} className={inputClass} />
              </Field>
              <Field label="Phone" required>
                <input name="phone" required defaultValue={visit.phone} className={inputClass} />
              </Field>
              <Field label="Email" required>
                <input name="email" type="email" required defaultValue={visit.email} className={inputClass} />
              </Field>
              <div className="md:col-span-2 xl:col-span-3">
                <p className="mb-2 text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  Services<span className="ml-0.5 text-rose-500">*</span>
                </p>
                <ServiceChecklist catalog={settings.services} selectedIds={editServiceIds} onChange={setEditServiceIds} />
                <p className="mt-2 text-sm font-medium">Total {money(servicesTotal(settings.services.filter((item) => editServiceIds.includes(item.id))))}</p>
              </div>
              <Field label="Location">
                <select name="location" defaultValue={visit.location} className={inputClass}>
                  {settings.locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Company or Agency name to send results to" required>
                <input name="payerName" required defaultValue={visit.payerName} className={inputClass} />
              </Field>
              <Field label="Company or Agency email" required>
                <input name="payerEmail" required defaultValue={visit.payerEmail} className={inputClass} />
              </Field>
              <Field label="Company or Agency phone" required>
                <input name="payerPhone" required defaultValue={visit.payerPhone} className={inputClass} />
              </Field>
              <div className="flex items-end">
                <PrimaryButton type="submit">Save changes</PrimaryButton>
              </div>
            </form>
          </div>
        ) : null}

        {tab === "shipment" ? (
          <div>
            {!(visit.trackingNumber || visit.shippedAt) && !creatingShipment ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 py-6">
                <p className="text-sm text-slate-500">No shipment on this visit yet.</p>
                <PrimaryButton type="button" onClick={startCreateShipment}>
                  <Plus size={16} /> Create shipment
                </PrimaryButton>
              </div>
            ) : (
              <>
                <p className="font-semibold">{visit.trackingNumber || visit.shippedAt ? "Shipment" : "New shipment"}</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Status">
                    <select
                      className={inputClass}
                      value={shipStatus}
                      onChange={(e) => setShipStatus(e.target.value as LabStatus)}
                    >
                      {(Object.keys(labLabel) as LabStatus[])
                        .filter((key) => key !== "not_required")
                        .map((key) => (
                          <option key={key} value={key}>
                            {labLabel[key]}
                          </option>
                        ))}
                    </select>
                  </Field>
                  <Field label="Carrier">
                    <select className={inputClass} value={carrier} onChange={(e) => setCarrier(e.target.value)}>
                      <option>FedEx</option>
                      <option>UPS</option>
                      <option>USPS</option>
                      <option>Courier</option>
                    </select>
                  </Field>
                  <Field label="Tracking number">
                    <input className={inputClass} value={tracking} onChange={(e) => setTracking(e.target.value)} />
                  </Field>
                  <Field label="Expected delivery">
                    <input type="date" className={inputClass} value={expected} onChange={(e) => setExpected(e.target.value)} />
                  </Field>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <PrimaryButton type="button" onClick={saveShipment} disabled={!tracking.trim() || !expected}>
                    Save shipment
                  </PrimaryButton>
                  {creatingShipment && !(visit.trackingNumber || visit.shippedAt) ? (
                    <GhostButton type="button" onClick={() => setCreatingShipment(false)}>
                      Cancel
                    </GhostButton>
                  ) : null}
                </div>
                {visit.trackingNumber || visit.shippedAt ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-blue-100 dark:border-slate-700">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-blue-50/80 px-4 py-2.5 dark:bg-slate-800/80">
                      <p className="text-sm font-semibold">Current shipment</p>
                      <LabPill visit={visit} />
                    </div>
                    <div className="grid sm:grid-cols-6">
                      {[
                        ["Status", labLabel[visit.labStatus]],
                        ["Carrier", visit.carrier ?? "—"],
                        ["Tracking", visit.trackingNumber ?? "—"],
                        ["Shipped", visit.shippedAt ? formatDateTime(visit.shippedAt) : "—"],
                        ["Expected", visit.expectedDeliveryAt ? formatDate(visit.expectedDeliveryAt) : "—"],
                        ["Delivered", visit.deliveredAt ? formatDateTime(visit.deliveredAt) : "Not yet"],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="border-t border-blue-50 px-4 py-3 sm:border-l sm:first:border-l-0 dark:border-slate-700"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        {tab === "results" ? (
          <div>
            <p className="font-semibold">Results file & delivery</p>
            <div
              className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-4 dark:border-slate-600 dark:bg-slate-800/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void onPickFile(e.dataTransfer.files[0]);
              }}
            >
              <p className="text-sm font-medium">{hasPdf ? "Replace result PDF" : "Upload result PDF"}</p>
              <p className="mt-1 text-xs text-slate-500">Choose or drop the PDF. It is saved on this visit.</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PrimaryButton type="button" disabled={fileBusy} onClick={() => fileRef.current?.click()}>
                  {fileBusy ? "Saving…" : hasPdf ? "Replace PDF" : "Choose PDF"}
                </PrimaryButton>
                {fileUrl ? (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 dark:border-slate-600 dark:bg-slate-900 dark:text-blue-300"
                  >
                    Open saved PDF
                  </a>
                ) : null}
              </div>
              {visit.resultFileName ? (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  {visit.resultFileName}
                  {visit.resultFileSize ? ` · ${formatBytes(visit.resultFileSize)}` : ""}
                  {hasPdf ? " · saved" : " · upload the PDF to keep a copy"}
                </p>
              ) : null}
              {fileError ? <p className="mt-2 text-xs text-rose-700">{fileError}</p> : null}
            </div>
            <div className="mt-4 max-w-sm">
              <Field label="Status">
                <select
                  className={inputClass}
                  value={visit.resultDeliveryStatus}
                  onChange={(e) => setResultStatus(e.target.value as ResultDeliveryStatus)}
                >
                  {(Object.keys(resultLabel) as ResultDeliveryStatus[]).map((key) => (
                    <option key={key} value={key}>
                      {resultLabel[key]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-4 space-y-3">
              <ResultEmailPreview
                visit={{
                  ...visit,
                  draftSubject: visit.draftSubject || resultMail.subject,
                  draftBody: visit.draftBody || resultMail.body,
                  sentTo: visit.sentTo || resultMail.recipient,
                }}
              />
              {visit.resultDeliveryStatus === "sent" ? (
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Email sent to the client.</p>
              ) : (
                <PrimaryButton type="button" onClick={sendDraftEmail}>
                  Send draft email
                </PrimaryButton>
              )}
            </div>
          </div>
        ) : null}

        {tab === "billing" ? (
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">Billing</p>
                <p className="text-[11px] text-slate-500">Invoice created at check-in</p>
              </div>
              <BillingPill visit={visit} />
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{money(visit.amount)}</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {serviceLinesOf(visit).map((line) => (
                <li key={line.id} className="flex justify-between gap-3">
                  <span>{line.name}</span>
                  <span className="font-medium">{money(line.price)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-xs text-slate-500">
              {visit.invoiceNumber} ·{" "}
              {visit.paymentModel === "trigger"
                ? "Trigger pay"
                : visit.paymentModel === "self_pay"
                  ? "Self-pay"
                  : `Net ${visit.netTermsDays}`}{" "}
              · due {formatDate(visit.dueDate)}
            </p>
            <div className="mt-4 max-w-sm">
              <Field label="Invoice status">
                <select
                  className={inputClass}
                  value={visit.billingStatus}
                  onChange={(e) => setBillingStatus(e.target.value as BillingStatus)}
                >
                  {(Object.keys(billingLabel) as BillingStatus[]).map((key) => (
                    <option key={key} value={key}>
                      {billingLabel[key]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            {visit.billingStatus === "payment_received" ? (
              <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-800 dark:bg-violet-950/50">
                <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">QuickBooks payment received</p>
                <p className="mt-1 text-xs text-violet-800 dark:text-violet-200">
                  {money(visit.amount)}
                  {visit.quickbooksRef ? ` · ${visit.quickbooksRef}` : ""}. Approve to mark this invoice paid.
                </p>
                <PrimaryButton type="button" className="mt-3" onClick={approvePayment}>
                  Approve payment
                </PrimaryButton>
              </div>
            ) : null}
            {visit.billingStatus === "invoiced" || visit.billingStatus === "overdue" ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  {visit.billingStatus === "overdue" ? "Past due — still waiting on QuickBooks" : "Waiting on QuickBooks"}
                </p>
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                  When QuickBooks posts a payment, this tab will ask you to approve it.
                </p>
                <GhostButton type="button" className="mt-3" onClick={markQbReceived}>
                  Demo: payment posted in QuickBooks
                </GhostButton>
              </div>
            ) : null}
            {visit.billingStatus === "paid" ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/40">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Paid</p>
                <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-200">
                  {visit.paidAt ? formatDateTime(visit.paidAt) : "Approved"}
                  {visit.quickbooksRef ? ` · ${visit.quickbooksRef}` : ""}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === "log" ? (
          <div>
            <p className="font-semibold">Activity log</p>
            <ul className="mt-3 space-y-2">
              {visit.audit.length === 0 ? (
                <li className="text-sm text-slate-500">No events yet.</li>
              ) : (
                visit.audit.map((event) => (
                  <li key={event.id} className="flex gap-3 text-sm">
                    <span className="w-32 shrink-0 text-slate-400">{formatDateTime(event.at)}</span>
                    <span className="font-medium">{event.actor}</span>
                    <span className="text-slate-600 dark:text-slate-300">{event.message}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : null}
      </Card>
    </AppShell>
  );
}
