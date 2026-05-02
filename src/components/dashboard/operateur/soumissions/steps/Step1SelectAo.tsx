"use client";

import { useState } from "react";
import { Search, CheckCircle2 } from "lucide-react";
import { TYPE_LABELS, fmtDate, type AoOption } from "../wizard-types";
import { SectionTitle, NavButtons } from "../wizard-ui";

interface Props {
  aoOptions: AoOption[];
  selectedAoId: string;
  selectedLotId: string;
  isLoadingAos?: boolean;
  isErrorAos?: boolean;
  onSelectAo: (id: string) => void;
  onSelectLot: (id: string) => void;
  onNext: () => void;
  dict: any;
  navDict: any;
}

export default function Step1({
  aoOptions,
  selectedAoId,
  selectedLotId,
  isLoadingAos,
  isErrorAos,
  onSelectAo,
  onSelectLot,
  onNext,
  dict,
  navDict,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = aoOptions.filter((ao) =>
    !search.trim() ||
    ao.reference.toLowerCase().includes(search.toLowerCase()) ||
    ao.object.toLowerCase().includes(search.toLowerCase()) ||
    ao.organizationName.toLowerCase().includes(search.toLowerCase())
  );

  const selectedAo: AoOption | undefined = aoOptions.find((ao) => ao.id === selectedAoId);
  const canProceed = !!selectedAoId && !!selectedLotId;

  return (
    <div className="space-y-5">
      <SectionTitle
        title={dict.title}
        subtitle={dict.subtitle}
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={dict.searchPlaceholder}
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#4CAF50] focus:bg-white transition-colors"
        />
      </div>

      {/* AO list */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {isLoadingAos && (
          <div className="space-y-2 py-1">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        )}
        {isErrorAos && (
          <p className="py-4 text-center text-xs text-rose-500">
            {dict.loadingError}
          </p>
        )}
        {!isLoadingAos && !isErrorAos && filtered.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-400">{dict.notFound}</p>
        )}
        {!isLoadingAos && !isErrorAos && filtered.map((ao) => {
          const isSelected = ao.id === selectedAoId;
          return (
            <button
              key={ao.id}
              type="button"
              onClick={() => onSelectAo(ao.id)}
              className={`w-full rounded-xl border p-3 text-left transition-all ${
                isSelected ? "border-[#4CAF50] bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-[#4CAF50]/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="font-mono text-[10px] font-bold text-slate-400">{ao.reference}</span>
                    <span className="inline-flex rounded-full bg-sky-50 px-1.5 py-px text-[9px] font-medium text-sky-700">
                      {TYPE_LABELS[ao.type]}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-px text-[9px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-2.5 w-2.5" />{dict.selected}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">{ao.object}</p>
                  <p className="text-[10px] text-slate-500">{ao.organizationName} &middot; {ao.wilaya}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[9px] text-slate-400">{dict.limit}</p>
                  <p className="text-[10px] font-semibold text-rose-600">{fmtDate(ao.deadline)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Lots */}
      {selectedAo && (
        <div className="rounded-xl border border-[#4CAF50]/20 bg-emerald-50/50 p-4">
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            {dict.selectLot} - {selectedAo.reference}
          </p>
          <div className="space-y-2">
            {selectedAo.lots.map((lot) => {
              const checked = selectedLotId === lot.id;
              return (
                <label key={lot.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  checked ? "border-[#4CAF50] bg-white" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}>
                  <input type="radio" name="selectedLot" checked={checked} onChange={() => onSelectLot(lot.id)}
                    className="mt-0.5 h-4 w-4 rounded accent-[#4CAF50]" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{dict.lot} {lot.lotNumber} &ndash; {lot.designation}</p>
                    {lot.estimatedAmount && (
                      <p className="text-[10px] text-slate-500">{dict.estimatedAmount} {lot.estimatedAmount}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <NavButtons onNext={onNext} disabled={!canProceed} dict={navDict} />
    </div>
  );
}