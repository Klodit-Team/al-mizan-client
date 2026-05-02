"use client";

import { Plus, Trash2, ShieldCheck, Lock } from "lucide-react";
import { type AoLot, type AoOption, type LotBpu, type BpuLine } from "../wizard-types";
import { SectionTitle, NavButtons } from "../wizard-ui";

function calcTotal(line: BpuLine): number {
  const quantite = parseFloat(line.quantite.replace(/\s/g, "").replace(",", ".")) || 0;
  const prixUnitaire = parseFloat(line.prixUnitaire.replace(/\s/g, "").replace(",", ".")) || 0;
  return quantite * prixUnitaire;
}

function fmtDZD(value: number): string {
  if (!value) return "-";

  return `${value.toLocaleString("fr-DZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} DZD`;
}

function lotTotal(lines: BpuLine[]): number {
  return lines.reduce((sum, line) => sum + calcTotal(line), 0);
}

function LotBpuTable({
  lot,
  bpu,
  onChange,
  dict,
}: {
  lot: AoLot;
  bpu: LotBpu;
  onChange: (updated: LotBpu) => void;
  dict: any;
}) {
  function updateLine(lineId: string, field: keyof BpuLine, value: string) {
    onChange({
      ...bpu,
      lines: bpu.lines.map((line) => (line.id === lineId ? { ...line, [field]: value } : line)),
    });
  }

  function addLine() {
    onChange({
      ...bpu,
      lines: [
        ...bpu.lines,
        {
          id: `${lot.id}-l${Date.now()}`,
          designation: "",
          unite: "U",
          quantite: "1",
          prixUnitaire: "",
        },
      ],
    });
  }

  function removeLine(lineId: string) {
    if (bpu.lines.length <= 1) return;

    onChange({
      ...bpu,
      lines: bpu.lines.filter((line) => line.id !== lineId),
    });
  }

  const total = lotTotal(bpu.lines);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
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

      <div className="grid grid-cols-[2fr_80px_80px_130px_130px_32px] gap-2 bg-slate-50 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
        <span>{dict.line}</span>
        <span>{dict.unit}</span>
        <span>{dict.quantity}</span>
        <span>{dict.unitPrice}</span>
        <span className="text-right">{dict.totalHt}</span>
        <span />
      </div>

      <div className="divide-y divide-slate-50">
        {bpu.lines.map((line, index) => (
          <div key={line.id} className="grid grid-cols-[2fr_80px_80px_130px_130px_32px] items-center gap-2 px-4 py-2">
            <input
              type="text"
              value={line.designation}
              onChange={(event) => updateLine(line.id, "designation", event.target.value)}
              placeholder={`${dict.line} ${index + 1}`}
              className="h-8 w-full rounded border border-slate-200 px-2 text-xs text-slate-800 outline-none focus:border-[#4CAF50] transition-colors"
            />
            <input
              type="text"
              value={line.unite}
              onChange={(event) => updateLine(line.id, "unite", event.target.value)}
              placeholder="U"
              className="h-8 w-full rounded border border-slate-200 px-2 text-xs text-center text-slate-700 outline-none focus:border-[#4CAF50] transition-colors"
            />
            <input
              type="text"
              value={line.quantite}
              onChange={(event) => updateLine(line.id, "quantite", event.target.value)}
              placeholder="1"
              className="h-8 w-full rounded border border-slate-200 px-2 text-xs text-center text-slate-700 outline-none focus:border-[#4CAF50] transition-colors"
            />
            <div className="relative">
              <input
                type="text"
                value={line.prixUnitaire}
                onChange={(event) => updateLine(line.id, "prixUnitaire", event.target.value)}
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

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2">
        <button
          type="button"
          onClick={addLine}
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#4CAF50] hover:underline"
        >
          <Plus className="h-3 w-3" />{dict.add}
        </button>
        <div className="text-right">
          <span className="text-[10px] font-semibold text-slate-500">{dict.totalHt} LOT {lot.lotNumber} :</span>{" "}
          <span className="text-xs font-bold text-[#364150]">{fmtDZD(total)}</span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  selectedAo: AoOption | null;
  selectedLotId: string;
  lotBpus: LotBpu[];
  onChange: (updated: LotBpu[]) => void;
  onBack: () => void;
  onNext: () => void;
  dict: any;
  navDict: any;
}

export default function Step4OffreFinanciere({
  selectedAo,
  selectedLotId,
  lotBpus,
  onChange,
  onBack,
  onNext,
  dict,
  navDict,
}: Props) {
  const selectedLots: AoLot[] = selectedAo?.lots.filter((lot) => lot.id === selectedLotId) ?? [];

  function updateBpu(updated: LotBpu) {
    onChange(lotBpus.map((item) => (item.lotId === updated.lotId ? updated : item)));
  }

  const grandTotal = lotBpus.reduce((sum, bpu) => sum + lotTotal(bpu.lines), 0);
  const allFilled = lotBpus.every((bpu) => bpu.lines.every((line) => !!line.prixUnitaire.trim()));

  return (
    <div className="space-y-5">
      <SectionTitle
        title={dict.title}
        subtitle={dict.subtitle}
      />

      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
        <Lock className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
        <p className="text-[11px] text-blue-700">
          Votre offre financiere sera chiffree cote client puis transmise en fichier chiffre conforme au service soumission.
        </p>
      </div>

      <div className="space-y-4">
        {selectedLots.map((lot) => {
          const bpu = lotBpus.find((entry) => entry.lotId === lot.id);
          if (!bpu) return null;

          return <LotBpuTable key={lot.id} lot={lot} bpu={bpu} onChange={updateBpu} dict={dict} />;
        })}
      </div>

      {selectedLots.length > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-[#4CAF50]/20 bg-emerald-50 px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Total general HT (tous lots)</span>
          <span className={`text-sm font-bold ${grandTotal ? "text-[#364150]" : "text-slate-300"}`}>
            {fmtDZD(grandTotal)}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 text-[10px] text-slate-400">
        <ShieldCheck className="h-4 w-4 text-slate-300" />
        Les montants sont prepares localement puis chiffres au moment du depot final.
      </div>

      <NavButtons onBack={onBack} onNext={onNext} disabled={!allFilled || lotBpus.length === 0} dict={navDict} />
    </div>
  );
}
