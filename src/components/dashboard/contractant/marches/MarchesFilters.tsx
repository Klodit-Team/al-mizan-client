"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TenderMarcheStatus } from "@/services/tenderMarches";

export interface MarchesFiltersState {
  status: "all" | TenderMarcheStatus;
  keyword: string;
  dateStart: string;
  dateEnd: string;
}

interface MarchesFiltersProps {
  isRtl: boolean;
  filters: MarchesFiltersState;
  onFilterChange: (key: keyof MarchesFiltersState, value: string) => void;
  onReset: () => void;
}

const statusOptions: Array<{
  value: "all" | TenderMarcheStatus;
  label: string;
}> = [
  { value: "all", label: "Tous" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Termine" },
  { value: "resilie", label: "Resilie" },
];

export default function MarchesFilters({
  isRtl,
  filters,
  onFilterChange,
  onReset,
}: MarchesFiltersProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Recherche
          </label>
          <div className="relative">
            <Input
              value={filters.keyword}
              onChange={(event) =>
                onFilterChange("keyword", event.target.value)
              }
              placeholder="Reference, objet, operateur..."
              className={cn(
                "h-9 border-slate-200 bg-slate-50 text-xs",
                isRtl ? "pr-9" : "pl-9",
              )}
            />
            <Search
              className={cn(
                "pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400",
                isRtl ? "right-3" : "left-3",
              )}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Date debut signature
          </label>
          <Input
            type="date"
            value={filters.dateStart}
            onChange={(event) =>
              onFilterChange("dateStart", event.target.value)
            }
            className="h-9 border-slate-200 bg-slate-50 text-xs"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Date fin signature
          </label>
          <Input
            type="date"
            value={filters.dateEnd}
            onChange={(event) => onFilterChange("dateEnd", event.target.value)}
            className="h-9 border-slate-200 bg-slate-50 text-xs"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {statusOptions.map((item) => {
          const isActive = filters.status === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onFilterChange("status", item.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors",
                isActive
                  ? "border-[#4CAF50] bg-[#4CAF50] text-white"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",
              )}
            >
              {item.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onReset}
          className="ml-auto rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          Reinitialiser
        </button>
      </div>
    </section>
  );
}
