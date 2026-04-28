"use client";

import { cn } from "@/lib/utils";
import type { GreAGreRequestStatus } from "@/services/greAGre";

interface GreAGreFiltersProps {
  status: "all" | GreAGreRequestStatus;
  onStatusChange: (value: "all" | GreAGreRequestStatus) => void;
  dict?: any;
}

export default function GreAGreFilters({
  status,
  onStatusChange,
  dict,
}: GreAGreFiltersProps) {
  const statusItems: Array<{
    value: "all" | GreAGreRequestStatus;
    label: string;
  }> = [
    { value: "all", label: dict?.all || "Tous" },
    { value: "brouillon", label: dict?.brouillon || "Brouillon" },
    { value: "soumise", label: dict?.soumise || "Soumise" },
    { value: "en_analyse_ia", label: dict?.en_analyse_ia || "En analyse IA" },
    { value: "acceptee", label: dict?.acceptee || "Acceptee" },
    { value: "rejetee", label: dict?.rejetee || "Rejetee" },
    { value: "en_revision", label: dict?.en_revision || "En revision" },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {dict?.title || "Filtrer par statut"}
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
