import type { CatalogService } from "@/lib/types";
import { money } from "@/lib/utils";

export function ServiceChecklist({
  catalog,
  selectedIds,
  onChange,
}: {
  catalog: CatalogService[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {catalog.map((item) => {
        const checked = selectedIds.includes(item.id);
        return (
          <label
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 px-3 py-2.5 text-sm dark:border-slate-700"
          >
            <span className="flex min-w-0 items-center gap-2">
              <input
                type="checkbox"
                className="accent-blue-600"
                checked={checked}
                onChange={() =>
                  onChange(checked ? selectedIds.filter((id) => id !== item.id) : [...selectedIds, item.id])
                }
              />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="shrink-0 font-medium">{money(item.price)}</span>
          </label>
        );
      })}
    </div>
  );
}
