"use client";

import { useState } from "react";
import { Search, CheckCircle2 } from "lucide-react";
import { AO_OPTIONS, TYPE_LABELS, fmtDate, type AoOption } from "../wizard-types";
import { SectionTitle, NavButtons } from "../wizard-ui";

interface Props {
  selectedAoId: string;
  selectedLotIds: string[];
  onSelectAo: (id: string) => void;
  onToggleLot: (id: string) => void;
  onNext: () => void;
}

export default function Step1({ selectedAoId, selectedLotIds, onSelectAo, onToggleLot, onNext }: Props) {
  const [search, setSearch] = useState("");

  const filtered = AO_OPTIONS.filter((ao) =>
    !search.trim() ||
    ao.reference.toLowerCase().includes(search.toLowerCase()) ||
    ao.object.toLowerCase().includes(search.toLowerCase()) ||
    ao.organizationName.toLowerCase().includes(search.toLowerCase())
  );

  const selectedAo: AoOption | undefined = AO_OPTIONS.find((ao) => ao.id === selectedAoId);
  const canProceed = !!selectedAoId && selectedLotIds.length > 0;

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Sélection de l'appel d'offres"
        subtitle="Choisissez l'AO auquel vous souhaitez soumissionner, puis sélectionnez les lots concernés."
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un appel d&apos;offres&amp;#8230;"
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#4CAF50] focus:bg-white transition-colors"
        />
      </div>

      {/* AO list */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-400">Aucun appel d&apos;offres trouvé</p>
        )}
        {filtered.map((ao) => {
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
                        <CheckCircle2 className="h-2.5 w-2.5" />Sélectionné
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">{ao.object}</p>
                  <p className="text-[10px] text-slate-500">{ao.organizationName} &middot; {ao.wilaya}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[9px] text-slate-400">Limite</p>
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
            Sélectionner les lots &mdash; {selectedAo.reference}
          </p>
          <div className="space-y-2">
            {selectedAo.lots.map((lot) => {
              const checked = selectedLotIds.includes(lot.id);
              return (
                <label key={lot.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  checked ? "border-[#4CAF50] bg-white" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}>
                  <input type="checkbox" checked={checked} onChange={() => onToggleLot(lot.id)}
                    className="mt-0.5 h-4 w-4 rounded accent-[#4CAF50]" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Lot {lot.lotNumber} &ndash; {lot.designation}</p>
                    {lot.estimatedAmount && (
                      <p className="text-[10px] text-slate-500">Montant estimé : {lot.estimatedAmount}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <NavButtons onNext={onNext} disabled={!canProceed} />
    </div>
  );
}