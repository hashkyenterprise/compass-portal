"use client";

import { StatRow } from "@/components/module-chrome";
import { AppShell } from "@/components/shell";
import { Card, Field, GhostButton, PageTitle, PrimaryButton, inputClass } from "@/components/ui";
import { useStore } from "@/lib/store";
import { formatDateTime, uid } from "@/lib/utils";
import { Building2, Clock, Link2, Mail, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const tabs = ["Clinic", "Services", "Locations", "Email", "QuickBooks"] as const;

export default function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Clinic");
  const [saved, setSaved] = useState<string | null>(null);

  function save(patch: Parameters<typeof updateSettings>[0], message: string) {
    updateSettings(patch);
    setSaved(message);
  }

  return (
    <AppShell>
      <PageTitle
        title="Settings"
        description="Clinic details, services and prices, locations, results email, and QuickBooks matching."
      />
      <StatRow
        items={[
          {
            label: "Clinic",
            value: "Active",
            hint: settings.timezone,
            icon: Building2,
            tint: "from-blue-500 to-sky-400",
          },
          {
            label: "Mail",
            value: settings.smtpConnected ? "On" : "Off",
            hint: settings.emailFromAddress,
            icon: Mail,
            tint: "from-indigo-500 to-blue-400",
          },
          {
            label: "QuickBooks",
            value: settings.qbConnected ? "On" : "Off",
            hint: settings.qbCompany || "Not linked",
            icon: Link2,
            tint: "from-sky-500 to-cyan-400",
          },
          {
            label: "Last QB sync",
            value: settings.qbLastSync ? "Synced" : "Never",
            hint: settings.qbLastSync ? formatDateTime(settings.qbLastSync) : "Connect to sync",
            icon: Clock,
            tint: "from-emerald-500 to-teal-400",
          },
        ]}
      />
      <div className="mb-4 flex w-fit gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-md px-3 py-1.5 text-[13px] font-medium ${
              tab === item
                ? "bg-zinc-100 text-zinc-950 dark:bg-slate-800 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {saved ? (
        <p className="mb-4 text-sm text-emerald-700">{saved}</p>
      ) : null}

      {tab === "Clinic" ? (
        <Card className="max-w-3xl p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Clinic name">
              <input
                className={inputClass}
                defaultValue={settings.clinicName}
                onBlur={(e) => save({ clinicName: e.target.value }, "Clinic name saved.")}
              />
            </Field>
            <Field label="Timezone">
              <input
                className={inputClass}
                defaultValue={settings.timezone}
                onBlur={(e) => save({ timezone: e.target.value }, "Timezone saved.")}
              />
            </Field>
            <Field label="Phone">
              <input
                className={inputClass}
                defaultValue={settings.clinicPhone}
                onBlur={(e) => save({ clinicPhone: e.target.value }, "Phone saved.")}
              />
            </Field>
            <Field label="Clinic email">
              <input
                className={inputClass}
                defaultValue={settings.clinicEmail}
                onBlur={(e) => save({ clinicEmail: e.target.value }, "Email saved.")}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Address">
                <input
                  className={inputClass}
                  defaultValue={settings.clinicAddress}
                  onBlur={(e) => save({ clinicAddress: e.target.value }, "Address saved.")}
                />
              </Field>
            </div>
          </div>
        </Card>
      ) : null}

      {tab === "Services" ? (
        <Card className="max-w-3xl overflow-x-auto">
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <p className="font-semibold">Services & prices</p>
              <p className="text-sm text-slate-500">These appear on new visits. Select one or more at check-in.</p>
            </div>
            <PrimaryButton
              type="button"
              onClick={() =>
                save(
                  {
                    services: [
                      ...settings.services,
                      { id: uid("svc"), name: "New service", price: 0 },
                    ],
                  },
                  "Service added.",
                )
              }
            >
              <Plus size={14} /> Add service
            </PrimaryButton>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-[11px] font-medium text-slate-500">
              <tr className="border-y border-blue-50">
                <th className="px-5 py-2">Service</th>
                <th className="px-5 py-2">Price</th>
                <th className="px-5 py-2 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {settings.services.map((item) => (
                <tr key={item.id} className="border-b border-slate-50">
                  <td className="px-5 py-2">
                    <input
                      className={inputClass}
                      defaultValue={item.name}
                      onBlur={(e) => {
                        const name = e.target.value.trim() || item.name;
                        save(
                          {
                            services: settings.services.map((row) =>
                              row.id === item.id ? { ...row, name } : row,
                            ),
                          },
                          "Service saved.",
                        );
                      }}
                    />
                  </td>
                  <td className="px-5 py-2">
                    <input
                      className={inputClass}
                      type="number"
                      step="0.01"
                      defaultValue={item.price}
                      onBlur={(e) => {
                        const price = Number(e.target.value || 0);
                        save(
                          {
                            services: settings.services.map((row) =>
                              row.id === item.id ? { ...row, price } : row,
                            ),
                          },
                          "Price saved.",
                        );
                      }}
                    />
                  </td>
                  <td className="px-5 py-2 text-right">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() =>
                        save(
                          { services: settings.services.filter((row) => row.id !== item.id) },
                          "Service removed.",
                        )
                      }
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}

      {tab === "Locations" ? (
        <Card className="max-w-3xl overflow-x-auto">
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <p className="font-semibold">Locations</p>
              <p className="text-sm text-slate-500">Used on new visits and filters across the portal.</p>
            </div>
            <PrimaryButton
              type="button"
              onClick={() =>
                save(
                  {
                    locations: [...settings.locations, { id: uid("loc"), name: "New location" }],
                  },
                  "Location added.",
                )
              }
            >
              <Plus size={14} /> Add location
            </PrimaryButton>
          </div>
          <ul className="mt-4 divide-y divide-slate-50">
            {settings.locations.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-5 py-2">
                <input
                  className={inputClass}
                  defaultValue={item.name}
                  onBlur={(e) => {
                    const name = e.target.value.trim() || item.name;
                    save(
                      {
                        locations: settings.locations.map((row) =>
                          row.id === item.id ? { ...row, name } : row,
                        ),
                      },
                      "Location saved.",
                    );
                  }}
                />
                <button
                  type="button"
                  className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  disabled={settings.locations.length < 2}
                  onClick={() =>
                    save(
                      { locations: settings.locations.filter((row) => row.id !== item.id) },
                      "Location removed.",
                    )
                  }
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {tab === "Email" ? (
        <div className="grid max-w-4xl gap-4">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Outgoing mail</p>
                <p className="text-xs text-zinc-500">Used as From on results drafts.</p>
              </div>
              <span
                className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                  settings.smtpConnected ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {settings.smtpConnected ? "Connected (demo)" : "Not connected"}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="From name">
                <input
                  className={inputClass}
                  defaultValue={settings.emailFromName}
                  onBlur={(e) => save({ emailFromName: e.target.value }, "From name saved.")}
                />
              </Field>
              <Field label="From address">
                <input
                  className={inputClass}
                  defaultValue={settings.emailFromAddress}
                  onBlur={(e) => save({ emailFromAddress: e.target.value }, "From address saved.")}
                />
              </Field>
              <Field label="Reply-to">
                <input
                  className={inputClass}
                  defaultValue={settings.emailReplyTo}
                  onBlur={(e) => save({ emailReplyTo: e.target.value }, "Reply-to saved.")}
                />
              </Field>
              <Field label="SMTP host">
                <input
                  className={inputClass}
                  defaultValue={settings.smtpHost}
                  onBlur={(e) => save({ smtpHost: e.target.value }, "SMTP host saved.")}
                />
              </Field>
              <Field label="SMTP port">
                <input
                  className={inputClass}
                  defaultValue={settings.smtpPort}
                  onBlur={(e) => save({ smtpPort: e.target.value }, "SMTP port saved.")}
                />
              </Field>
              <Field label="SMTP user">
                <input
                  className={inputClass}
                  defaultValue={settings.smtpUser}
                  onBlur={(e) => save({ smtpUser: e.target.value }, "SMTP user saved.")}
                />
              </Field>
            </div>
            <div className="mt-4 flex gap-2">
              <PrimaryButton
                type="button"
                onClick={() => save({ smtpConnected: true }, "Mail marked connected for this demo. Live SMTP is wired at hosting.")}
              >
                Test connection
              </PrimaryButton>
              <GhostButton type="button" onClick={() => save({ smtpConnected: false }, "Mail disconnected.")}>
                Disconnect
              </GhostButton>
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-semibold">Results template</p>
            <p className="mb-4 text-xs text-zinc-500">
              Tokens: {"{{fullName}} {{lastName}} {{visitNumber}} {{service}} {{visitDate}} {{attachment}} {{clinicName}} {{clinicAddress}} {{clinicPhone}}"}
            </p>
            <div className="grid gap-4">
              <Field label="Subject">
                <input
                  className={inputClass}
                  defaultValue={settings.resultsSubject}
                  onBlur={(e) => save({ resultsSubject: e.target.value }, "Subject saved.")}
                />
              </Field>
              <Field label="Body">
                <textarea
                  className={`${inputClass} min-h-56`}
                  defaultValue={settings.resultsBody}
                  onBlur={(e) => save({ resultsBody: e.target.value }, "Template saved. New drafts will use it.")}
                />
              </Field>
            </div>
          </Card>
        </div>
      ) : null}

      {tab === "QuickBooks" ? (
        <Card className="max-w-3xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">QuickBooks Online</p>
              <p className="text-xs text-zinc-500">
                Stripe and Valor Pay already post into QuickBooks. This portal matches visits to those payments.
              </p>
            </div>
            <span
              className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                settings.qbConnected ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {settings.qbConnected ? "Connected (demo)" : "Not connected"}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Company">
              <input
                className={inputClass}
                defaultValue={settings.qbCompany}
                onBlur={(e) => save({ qbCompany: e.target.value }, "Company saved.")}
              />
            </Field>
            <Field label="Match payments by">
              <select
                className={inputClass}
                value={settings.qbMatchBy}
                onChange={(e) =>
                  save({ qbMatchBy: e.target.value as typeof settings.qbMatchBy }, "Match rule saved.")
                }
              >
                <option value="visit">Visit number</option>
                <option value="invoice">Invoice number</option>
                <option value="payer">Payer / agency</option>
              </select>
            </Field>
            <Field label="Realm ID" hint="Filled after Adrienne authorizes QuickBooks.">
              <input
                className={inputClass}
                defaultValue={settings.qbRealmId}
                placeholder="Not set"
                onBlur={(e) => save({ qbRealmId: e.target.value }, "Realm ID saved.")}
              />
            </Field>
            <Field label="Last sync">
              <input
                className={inputClass}
                readOnly
                value={settings.qbLastSync ? formatDateTime(settings.qbLastSync) : "Never"}
              />
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <PrimaryButton
              type="button"
              onClick={() =>
                save(
                  { qbConnected: true, qbLastSync: new Date().toISOString(), qbRealmId: settings.qbRealmId || "demo-realm" },
                  "QuickBooks marked connected for this demo. OAuth is added at hosting.",
                )
              }
            >
              Connect QuickBooks
            </PrimaryButton>
            <GhostButton
              type="button"
              onClick={() => save({ qbLastSync: new Date().toISOString() }, "Demo sync completed.")}
              disabled={!settings.qbConnected}
            >
              Sync now
            </GhostButton>
            <GhostButton type="button" onClick={() => save({ qbConnected: false }, "QuickBooks disconnected.")}>
              Disconnect
            </GhostButton>
          </div>
        </Card>
      ) : null}
    </AppShell>
  );
}
