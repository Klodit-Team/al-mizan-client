"use client";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface TendersFiltersDict {
  status: string;
  all: string;
  draft: string;
  published: string;
  ongoing: string;
  evaluation: string;
  awarded: string;
  cancelled: string;
  dateStart?: string;
  dateEnd?: string;
  reset?: string;
}

interface TendersListDict {
  searchPlaceholder: string;
  filters: TendersFiltersDict;
}

export interface AoFiltersState {
  keyword: string;
  status: string;
  dateStart: string;
  dateEnd: string;
}

interface AoFiltersProps {
  dict: TendersListDict;
  isRtl: boolean;
  filters: AoFiltersState;
  onFilterChange: (key: keyof AoFiltersState, value: string) => void;
}

export default function AoFilters({
  dict,
  isRtl,
  filters,
  onFilterChange,
}: AoFiltersProps) {
  const statusItems = [
    { value: "all", label: dict.filters.all },
    { value: "brouillon", label: dict.filters.draft },
    { value: "publie", label: dict.filters.published },
    { value: "en_cours", label: dict.filters.ongoing },
    { value: "evaluation", label: dict.filters.evaluation },
    { value: "attribue", label: dict.filters.awarded },
    { value: "annule", label: dict.filters.cancelled },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Search
          </label>
          <div className="relative">
            <Input
              value={filters.keyword}
              onChange={(event) =>
                onFilterChange("keyword", event.target.value)
              }
              placeholder={dict.searchPlaceholder}
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
            {dict.filters.dateStart}
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
            {dict.filters.dateEnd}
          </label>
          <Input
            type="date"
            value={filters.dateEnd}
            onChange={(event) => onFilterChange("dateEnd", event.target.value)}
            className="h-9 border-slate-200 bg-slate-50 text-xs"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
          Filter by status
        </p>
        <div className="flex flex-wrap gap-2">
          {statusItems.map((item) => {
            const isActive = filters.status === item.value;
            return (
              <button
                type="button"
                key={item.value}
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
        </div>
      </div>
    </section>
  );
}
