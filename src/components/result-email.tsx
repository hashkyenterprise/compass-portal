import type { Visit } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function ResultEmailPreview({ visit }: { visit: Visit }) {
  if (!visit.draftSubject && !visit.draftBody) return null;
  const to = visit.sentTo || (visit.payerEmail !== "N/A" ? visit.payerEmail : visit.email);
  const sent = visit.resultDeliveryStatus === "sent";

  return (
    <div className="rounded-xl border border-blue-100 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/60">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">{sent ? "Email sent to client" : "Draft email"}</p>
        {sent && visit.sentAt ? (
          <p className="text-xs text-slate-500">{formatDateTime(visit.sentAt)}</p>
        ) : null}
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">To</dt>
          <dd className="mt-0.5">{to}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Subject</dt>
          <dd className="mt-0.5 font-medium">{visit.draftSubject}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Message</dt>
          <dd className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{visit.draftBody}</dd>
        </div>
      </dl>
    </div>
  );
}
