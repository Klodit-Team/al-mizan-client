"use client";

import { cn } from "@/lib/utils";
import type { GreAGreRequestStatus } from "@/services/greAGre";

interface GreAGreFiltersProps {
  status: "all" | GreAGreRequestStatus;
  onStatusChange: (value: "all" | GreAGreRequestStatus) => void;
}

const statusItems: Array<{
  value: "all" | GreAGreRequestStatus;
  label: string;
}> = [
  { value: "all", label: "Tous" },
  { value: "brouillon", label: "Brouillon" },
  { value: "soumise", label: "Soumise" },
  { value: "en_analyse_ia", label: "En analyse IA" },
  { value: "acceptee", label: "Acceptee" },
  { value: "rejetee", label: "Rejetee" },
  { value: "en_revision", label: "En revision" },
];

export default function GreAGreFilters({
  status,
  onStatusChange,
}: GreAGreFiltersProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
        Filtrer par statut
      </p>

      <div className="flex flex-wrap gap-2">
        {statusItems.map((item) => {
          const isActive = status === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onStatusChange(item.value)}
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
    </section>
  );
}
