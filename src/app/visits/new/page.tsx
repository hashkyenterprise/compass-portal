"use client";

import { ServiceChecklist } from "@/components/service-checklist";
import { AppShell } from "@/components/shell";
import { Card, Field, GhostButton, PageTitle, PrimaryButton, inputClass } from "@/components/ui";
import { servicesTotal } from "@/lib/catalog";
import { intakeCopy } from "@/lib/intake";
import { useStore } from "@/lib/store";
import type { PaymentModel, ResultPath } from "@/lib/types";
import { money } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

function AckBlock({
  title,
  body,
  name,
  choice,
  required,
  defaultChecked,
}: {
  title: string;
  body: string;
  name: string;
  choice: string;
  required?: boolean;
  defaultChecked?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-blue-100 p-4 dark:border-slate-700">
      <p className="text-sm font-semibold text-slate-950">
        {title}
        {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
      <label className="mt-3 flex items-start gap-2.5 text-sm font-medium">
        <input name={name} type="checkbox" defaultChecked={defaultChecked} className="mt-0.5 accent-blue-600" />
        {choice}
      </label>
    </div>
  );
}

export default function NewVisitPage() {
  const { createVisit, settings } = useStore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    settings.services[0] ? [settings.services[0].id] : [],
  );
  const [resultPath, setResultPath] = useState<ResultPath>("same_day");
  const [paymentModel, setPaymentModel] = useState<PaymentModel>("trigger");
  const selectedLines = useMemo(
    () => settings.services.filter((item) => selectedIds.includes(item.id)),
    [settings.services, selectedIds],
  );
  const amount = servicesTotal(selectedLines);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const thirdPartyAuth = form.get("thirdPartyAuth") === "on";
    const identityAck = form.get("identityAck") === "on";
    const noDiagnosisAck = form.get("noDiagnosisAck") === "on";
    const submitAck = form.get("submitAck") === "on";
    if (!thirdPartyAuth || !identityAck || !noDiagnosisAck || !submitAck) {
      setError("Required acknowledgments must be confirmed before check-in.");
      return;
    }
    if (!selectedLines.length) {
      setError("Select at least one service.");
      return;
    }
    const visit = createVisit({
      firstName: String(form.get("firstName")),
      lastName: String(form.get("lastName")),
      phone: String(form.get("phone")),
      email: String(form.get("email")),
      service: selectedLines.map((line) => line.name).join(" · "),
      serviceLines: selectedLines,
      location: String(form.get("location")),
      payerName: String(form.get("payerName")),
      payerEmail: String(form.get("payerEmail")),
      payerPhone: String(form.get("payerPhone")),
      resultPath,
      paymentModel,
      netTermsDays: Number(form.get("netTermsDays") || 0),
      amount,
      optInElectronic: form.get("optInElectronic") === "on",
      thirdPartyAuth,
      identityAck,
      noDiagnosisAck,
    });
    router.push(`/visits/${visit.id}`);
  }

  return (
    <AppShell>
      <PageTitle
        title="Visitor registration"
        description="Same questions as the Compass visitor form, plus staff check-in fields for this visit."
      />
      <form onSubmit={onSubmit} className="mt-4 grid gap-5">
        <Card className="grid gap-5 p-6 md:grid-cols-2">
          <p className="text-sm font-semibold md:col-span-2">Visitor</p>
          <Field label="First Name" required>
            <input name="firstName" required className={inputClass} />
          </Field>
          <Field label="Last Name" required>
            <input name="lastName" required className={inputClass} />
          </Field>
          <Field label="Phone" required>
            <input name="phone" required className={inputClass} />
          </Field>
          <Field label="Email" required>
            <input name="email" type="email" required className={inputClass} />
          </Field>
          <div className="md:col-span-2">
            <p className="mb-2 text-[13px] font-medium text-slate-700 dark:text-slate-300">
              Services<span className="ml-0.5 text-rose-500">*</span>
            </p>
            <p className="mb-2 text-xs text-slate-500">Select every service for this visit. Prices come from Settings.</p>
            <ServiceChecklist catalog={settings.services} selectedIds={selectedIds} onChange={setSelectedIds} />
            <p className="mt-2 text-sm font-medium">Total {money(amount)}</p>
          </div>
        </Card>

        <Card className="grid gap-5 p-6 md:grid-cols-3">
          <p className="text-sm font-semibold md:col-span-3">Send results to</p>
          <Field label="Company or Agency name to send results to:" required hint={intakeCopy.naHint}>
            <input name="payerName" required placeholder="N/A" className={inputClass} />
          </Field>
          <Field label="Company or Agency email:" required hint={intakeCopy.naHint}>
            <input name="payerEmail" required placeholder="N/A" className={inputClass} />
          </Field>
          <Field label="Company or Agency phone:" required hint={intakeCopy.naHint}>
            <input name="payerPhone" required placeholder="N/A" className={inputClass} />
          </Field>
        </Card>

        <Card className="space-y-4 p-6">
          <AckBlock
            title={intakeCopy.optInTitle}
            body={intakeCopy.optInBody}
            name="optInElectronic"
            choice={intakeCopy.optInChoice}
            defaultChecked
          />
          <AckBlock
            title={intakeCopy.thirdPartyTitle}
            body={intakeCopy.thirdPartyBody}
            name="thirdPartyAuth"
            choice={intakeCopy.understand}
            required
          />
          <AckBlock
            title={intakeCopy.identityTitle}
            body={intakeCopy.identityBody}
            name="identityAck"
            choice={intakeCopy.understand}
            required
          />
          <AckBlock
            title={intakeCopy.diagnosisTitle}
            body={intakeCopy.diagnosisBody}
            name="noDiagnosisAck"
            choice={intakeCopy.understand}
            required
          />
          <div className="rounded-2xl border border-blue-100 p-4 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-950">
              {intakeCopy.submitTitle}
              <span className="ml-0.5 text-rose-500">*</span>
            </p>
            <div className="mt-2 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {intakeCopy.submitParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
            <label className="mt-3 flex items-start gap-2.5 text-sm font-medium">
              <input name="submitAck" type="checkbox" className="mt-0.5 accent-blue-600" />
              {intakeCopy.submitChoice}
            </label>
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </Card>

        <Card className="grid gap-5 p-6 md:grid-cols-4">
          <p className="text-sm font-semibold md:col-span-4">Staff check-in</p>
          <Field label="Location">
            <select name="location" className={inputClass} defaultValue={settings.locations[0]?.name}>
              {settings.locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Results path">
            <select
              className={inputClass}
              value={resultPath}
              onChange={(e) => setResultPath(e.target.value as ResultPath)}
            >
              <option value="same_day">Leave with results today</option>
              <option value="lab">Specimen to lab</option>
            </select>
          </Field>
          <Field label="Payment model">
            <select
              className={inputClass}
              value={paymentModel}
              onChange={(e) => setPaymentModel(e.target.value as PaymentModel)}
            >
              <option value="trigger">Contract trigger pay</option>
              <option value="invoice">Invoice with terms</option>
              <option value="self_pay">Pay on site</option>
            </select>
          </Field>
          <Field label="Amount" hint="Sum of selected services">
            <input className={inputClass} readOnly value={amount} />
          </Field>
          {paymentModel === "invoice" ? (
            <Field label="Net terms (days)">
              <input name="netTermsDays" type="number" defaultValue={30} className={inputClass} />
            </Field>
          ) : (
            <input type="hidden" name="netTermsDays" value="0" />
          )}
        </Card>

        <div className="flex gap-3">
          <PrimaryButton type="submit">Create visit record</PrimaryButton>
          <GhostButton type="button" onClick={() => router.push("/visits")}>
            Cancel
          </GhostButton>
        </div>
      </form>
    </AppShell>
  );
}
