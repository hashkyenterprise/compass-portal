"use client";

import { BillingPill, ResultPill, StagePill } from "@/components/visit-pills";
import { serviceLabel } from "@/lib/catalog";
import type { Visit } from "@/lib/types";
import { formatDateTime, money } from "@/lib/utils";
import { Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function VisitTable({ visits, compact = false }: { visits: Visit[]; compact?: boolean }) {
  const router = useRouter();
  const pad = compact ? "px-3 py-2" : "px-5 py-3.5";
  const head = compact ? "px-3 py-2" : "px-5 py-3";

  if (!visits.length) {
    return <p className="px-5 py-10 text-center text-sm text-zinc-500">Nothing in this list yet.</p>;
  }

  function openVisit(id: string) {
    router.push(`/visits/${id}`);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-[11px] font-medium text-zinc-500">
          <tr className="border-b border-zinc-100">
            <th className={`${head} font-semibold`}>Visit</th>
            <th className={`${head} font-semibold`}>Visitor</th>
            <th className={`${head} font-semibold`}>Service</th>
            <th className={`${head} font-semibold`}>Stage</th>
            <th className={`${head} font-semibold`}>Results</th>
            <th className={`${head} font-semibold`}>Billing</th>
            <th className={`${head} font-semibold`}>Amount</th>
            <th className={`${head} font-semibold text-right`}>Action</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((visit) => (
            <tr
              key={visit.id}
              className="relative cursor-pointer border-b border-zinc-50 hover:bg-blue-50/40"
              onClick={() => openVisit(visit.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openVisit(visit.id);
                }
              }}
              tabIndex={0}
            >
              <td className={`${pad} relative`}>
                <p className="relative font-medium text-zinc-950">{visit.visitNumber}</p>
                <p className="text-[11px] text-zinc-400">{formatDateTime(visit.createdAt)}</p>
              </td>
              <td className={pad}>
                <p className="font-medium">
                  {visit.firstName} {visit.lastName}
                </p>
                <p className="text-[11px] text-zinc-500">{visit.payerName}</p>
              </td>
              <td className={`${pad} text-zinc-600`}>{serviceLabel(visit)}</td>
              <td className={pad}>
                <StagePill visit={visit} />
              </td>
              <td className={pad}>
                <ResultPill visit={visit} />
              </td>
              <td className={pad}>
                <BillingPill visit={visit} />
              </td>
              <td className={`${pad} font-medium`}>{money(visit.amount)}</td>
              <td className={`${pad} text-right`} onClick={(e) => e.stopPropagation()}>
                <div className="inline-flex items-center gap-1">
                  <Link
                    href={`/visits/${visit.id}`}
                    title="View visit"
                    aria-label={`View ${visit.visitNumber}`}
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-800 dark:hover:text-blue-300"
                  >
                    <Eye size={15} />
                  </Link>
                  <Link
                    href={`/visits/${visit.id}?edit=1`}
                    title="Edit visit"
                    aria-label={`Edit ${visit.visitNumber}`}
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-800 dark:hover:text-blue-300"
                  >
                    <Pencil size={15} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
