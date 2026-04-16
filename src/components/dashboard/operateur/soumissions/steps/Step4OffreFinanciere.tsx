"use client";

import { useState } from "react";
import { Plus, Trash2, ShieldCheck, Lock } from "lucide-react";
import { AO_OPTIONS, type AoLot, type LotBpu, type BpuLine } from "../wizard-types";
import { SectionTitle, NavButtons } from "../wizard-ui";

// ─── BPU line helpers ─────────────────────────────────────────────────────────

function calcTotal(line: BpuLine): number {
  const q = parseFloat(line.quantite.replace(/\s/g, "").replace(",", ".")) || 0;
  const pu = parseFloat(line.prixUnitaire.replace(/\s/g, "").replace(",", ".")) || 0;
  return q * pu;
}

function fmtDZD(n: number): string {
  if (!n) return "—";
  return n.toLocaleString("fr-DZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD";
}

function lotTotal(lines: BpuLine[]): number {
  return lines.reduce((sum, l) => sum + calcTotal(l), 0);
}

// ─── BPU table for a single lot ───────────────────────────────────────────────

function LotBpuTable({
  lot,
  bpu,
  onChange,
}: {
  lot: AoLot;
  bpu: LotBpu;
  onChange: (updated: LotBpu) => void;
}) {
  function updateLine(lineId: string, field: keyof BpuLine, value: string) {
    onChange({
      ...bpu,
      lines: bpu.lines.map((l) => (l.id === lineId ? { ...l, [field]: value } : l)),
    });
  }

  function addLine() {
    onChange({
      ...bpu,
      lines: [
        ...bpu.lines,
        { id: `${lot.id}-l${Date.now()}`, designation: "", unite: "U", quantite: "1", prixUnitaire: "" },
      ],
    });
  }

  function removeLine(lineId: string) {
    if (bpu.lines.length <= 1) return;
    onChange({ ...bpu, lines: bpu.lines.filter((l) => l.id !== lineId) });
  }

  const total = lotTotal(bpu.lines);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Lot header */}
      <div className="flex items-center justify-between bg-[#4CAF50]/8 px-4 py-2.5 border-b border-slate-200">
        <div>
          <span className="inline-flex rounded-full bg-[#4CAF50]/15 px-2 py-px text-[10px] font-bold text-[#4CAF50]">
            LOT {lot.lotNumber}
          </span>
          <span className="ml-2 text-xs font-semibold text-slate-700">{lot.designation}</span>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-400 uppercase tracking-wide">Total HT</p>
          <p className={`text-xs font-bold ${total ? "text-[#364150]" : "text-slate-300"}`}>
            {fmtDZD(total)}
          </p>
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[2fr_80px_80px_130px_130px_32px] gap-2 bg-slate-50 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
        <span>Désignation</span>
        <span>Unité</span>
        <span>Qté</span>
        <span>Prix unit. HT</span>
        <span className="text-right">Montant HT</span>
        <span />
      </div>

      {/* Lines */}
      <div className="divide-y divide-slate-50">
        {bpu.lines.map((line, idx) => (
          <div key={line.id} className="grid grid-cols-[2fr_80px_80px_130px_130px_32px] items-center gap-2 px-4 py-2">
            <input
              type="text"
              value={line.designation}
              onChange={(e) => updateLine(line.id, "designation", e.target.value)}
              placeholder={`Prestation ${idx + 1}`}
              className="h-8 w-full rounded border border-slate-200 px-2 text-xs text-slate-800 outline-none focus:border-[#4CAF50] transition-colors"
            />
            <input
              type="text"
              value={line.unite}
              onChange={(e) => updateLine(line.id, "unite", e.target.value)}
              placeholder="U"
              className="h-8 w-full rounded border border-slate-200 px-2 text-xs text-center text-slate-700 outline-none focus:border-[#4CAF50] transition-colors"
            />
            <input
              type="text"
              value={line.quantite}
              onChange={(e) => updateLine(line.id, "quantite", e.target.value)}
              placeholder="1"
              className="h-8 w-full rounded border border-slate-200 px-2 text-xs text-center text-slate-700 outline-none focus:border-[#4CAF50] transition-colors"
            />
            <div className="relative">
              <input
                type="text"
                value={line.prixUnitaire}
                onChange={(e) => updateLine(line.id, "prixUnitaire", e.target.value)}
                placeholder="0,00"
                className="h-8 w-full rounded border border-slate-200 pl-2 pr-8 text-xs text-right text-slate-700 outline-none focus:border-[#4CAF50] transition-colors"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">DZD</span>
            </div>
            <p className={`text-xs text-right font-medium ${calcTotal(line) ? "text-slate-700" : "text-slate-300"}`}>
              {fmtDZD(calcTotal(line))}
            </p>
            <button
              type="button"
              onClick={() => removeLine(line.id)}
              disabled={bpu.lines.length <= 1}
              className="flex h-7 w-7 items-center justify-center rounded text-slate-300 hover:text-rose-400 disabled:opacity-20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add line + total row */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2">
        <button
          type="button"
          onClick={addLine}
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#4CAF50] hover:underline"
        >
          <Plus className="h-3 w-3" />Ajouter une ligne
        </button>
        <div className="text-right">
          <span className="text-[10px] font-semibold text-slate-500">TOTAL HT LOT {lot.lotNumber} :</span>{" "}
          <span className="text-xs font-bold text-[#364150]">{fmtDZD(total)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main step ────────────────────────────────────────────────────────────────

interface Props {
  selectedAoId: string;
  selectedLotIds: string[];
  lotBpus: LotBpu[];
  onChange: (updated: LotBpu[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step4OffreFinanciere({
  selectedAoId, selectedLotIds, lotBpus, onChange, onBack, onNext,
}: Props) {
  const ao = AO_OPTIONS.find((a) => a.id === selectedAoId);
  const selectedLots: AoLot[] = ao?.lots.filter((l) => selectedLotIds.includes(l.id)) ?? [];

  function updateBpu(updated: LotBpu) {
    onChange(lotBpus.map((b) => (b.lotId === updated.lotId ? updated : b)));
  }

  const grandTotal = lotBpus.reduce((sum, b) => sum + lotTotal(b.lines), 0);
  const allFilled  = lotBpus.every((b) => b.lines.every((l) => !!l.prixUnitaire.trim()));

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Offre financière (BPU)"
        subtitle="Saisissez votre bordereau des prix unitaires (BPU) pour chaque lot. Les montants seront chiffrés avant transmission."
      />

      {/* Encryption notice */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
        <Lock className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
        <p className="text-[11px] text-blue-700">
          Votre offre financière sera <span className="font-semibold">chiffrée E2EE (AES-256-GCM)</span> côté client.
          Elle ne sera déchiffrée qu’au moment de l’ouverture officielle des plis par la commission autorisée.
        </p>
      </div>

      {/* BPU tables per lot */}
      <div className="space-y-4">
        {selectedLots.map((lot) => {
          const bpu = lotBpus.find((b) => b.lotId === lot.id);
          if (!bpu) return null;
          return <LotBpuTable key={lot.id} lot={lot} bpu={bpu} onChange={updateBpu} />;
        })}
      </div>

      {/* Grand total */}
      {selectedLots.length > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-[#4CAF50]/20 bg-emerald-50 px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Total général HT (tous lots)</span>
          <span className={`text-sm font-bold ${grandTotal ? "text-[#364150]" : "text-slate-300"}`}>
            {fmtDZD(grandTotal)}
          </span>
        </div>
      )}

      {/* Security seal */}
      <div className="flex items-center gap-2 text-[10px] text-slate-400">
        <ShieldCheck className="h-4 w-4 text-slate-300" />
        Les montants sont stockés localement jusqu’à la soumission finale, puis chiffrés et transmis.
      </div>

      <NavButtons onBack={onBack} onNext={onNext} disabled={!allFilled} />
    </div>
  );
}