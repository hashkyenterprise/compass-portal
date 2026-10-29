import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ComponentType, ReactNode } from "react";

export type StatItem = {
  label: string;
  value: string;
  hint?: string;
  icon: ComponentType<{ size?: number }>;
  tint: string;
};

export function StatRow({ items }: { items: StatItem[] }) {
  return (
    <div className="mb-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  {stat.value}
                </p>
                {stat.hint ? <p className="text-[11px] text-slate-500 dark:text-slate-400">{stat.hint}</p> : null}
              </div>
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${stat.tint} text-white shadow-md shadow-blue-500/20`}
              >
                <Icon size={16} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export const filterClass =
  "rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-blue-100 bg-white/80 p-2.5 dark:border-slate-700 dark:bg-slate-900/80">
      {children}
    </div>
  );
}

export function FilterSearch({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(filterClass, "min-w-[180px] flex-1", className)}
    />
  );
}
