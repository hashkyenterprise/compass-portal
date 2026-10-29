import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function StatusPill({
  tone,
  children,
}: {
  tone: "blue" | "gold" | "green" | "red" | "slate" | "violet";
  children: ReactNode;
}) {
  const map = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
    gold: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
    red: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-200",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    violet: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        map[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("card-premium rounded-2xl", className)}>{children}</div>
  );
}

export function Field({
  label,
  children,
  hint,
  required,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
      </span>
      {children}
      {hint ? <span className="block text-xs text-slate-500 dark:text-slate-400">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-blue-100 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500";

export function PrimaryButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "btn-gradient inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h1>
        {description ? <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
