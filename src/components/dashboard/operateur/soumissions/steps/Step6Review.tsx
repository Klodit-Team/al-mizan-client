"use client";

import { useState } from "react";
import { CheckCircle2, FileText, ShieldCheck, Send, AlertCircle, Landmark, ClipboardList, Lock } from "lucide-react";
import {
  AO_OPTIONS, type AdminDoc, type LotBpu, type CautionData, type AoLot, fmtDate,
} from "../wizard-types";
import { SectionTitle, NavButtons } from "../wizard-ui";

function lotTotal(lines: LotBpu["lines"]): number {
  return lines.reduce((sum, l) => {
    const q  = parseFloat(l.quantite.replace(/\s/g, "").replace(",", "."))    || 0;
    const pu = parseFloat(l.prixUnitaire.replace(/\s/g, "").replace(",", ".")) || 0;
    return sum + q * pu;
  }, 0);
}

function fmtDZD(n: number): string {
  if (!n) return "—";
  return n.toLocaleString("fr-DZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DZD";
}

function SectionCard({ title, icon, children }: {
  title: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <span className="text-[#4CAF50]">{icon}</span>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-600">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-[11px] text-slate-500 shrink-0">{label}</span>
      <span className="text-[11px] font-semibold text-slate-800 text-right">{value}</span>
    </div>
  );
}

interface Props {
  selectedAoId: string;
  selectedLotIds: string[];
  docs: AdminDoc[];
  offreTechFile: File | null;
  lotBpus: LotBpu[];
  caution: CautionData;
  onBack: () => void;
  onSubmit: () => void;
}

export default function Step6Review({
  selectedAoId, selectedLotIds, docs, offreTechFile, lotBpus, caution, onBack, onSubmit,
}: Props) {
  const [declared, setDeclared] = useState(false);

  const ao = AO_OPTIONS.find((a) => a.id === selectedAoId);
  const selectedLots: AoLot[] = ao?.lots.filter((l) => selectedLotIds.includes(l.id)) ?? [];
  const grandTotal = lotBpus.reduce((sum, b) => sum + lotTotal(b.lines), 0);

  const conformDocs  = docs.filter((d) => d.status === "conforme" || d.status === "uploade");
  const missingDocs  = docs.filter((d) => d.required && (d.status === "manquant" || d.status === "expire"));

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Récapitulatif &amp; soumission"
        subtitle="Vérifiez l'intégralité de votre dossier avant de le déposer définitivement."
      />

      {/* Warning if still missing docs */}
      {missingDocs.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          <p className="text-xs text-rose-700">
            <span className="font-semibold">Attention :</span> {missingDocs.length} pièce{missingDocs.length > 1 ? "s" : ""} administrative{missingDocs.length > 1 ? "s" : ""} manquante{missingDocs.length > 1 ? "s" : ""}.
            Retournez à l&apos;étape 2 pour les compléter.
          </p>
        </div>
      )}

      {/* AO + lots */}
      <SectionCard title="Appel d'offres sélectionné" icon={<FileText className="h-4 w-4" />}>
        <Row label="Référence" value={<span className="font-mono">{ao?.reference ?? "—"}</span>} />
        <Row label="Objet" value={ao?.object ?? "—"} />
        <Row label="Organisme" value={ao?.organizationName ?? "—"} />
        <Row label="Date limite" value={fmtDate(ao?.deadline ?? "")} />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedLots.map((lot) => (
            <span key={lot.id} className="inline-flex rounded-full bg-[#4CAF50]/10 px-2 py-px text-[10px] font-semibold text-[#4CAF50]">
              Lot {lot.lotNumber} &ndash; {lot.designation}
            </span>
          ))}
        </div>
      </SectionCard>

      {/* Admin docs */}
      <SectionCard title="Pièces administratives" icon={<ShieldCheck className="h-4 w-4" />}>
        <div className="space-y-1">
          {docs.map((doc) => {
            const ok = doc.status === "conforme" || doc.status === "uploade";
            return (
              <div key={doc.id} className="flex items-center gap-2">
                {ok
                  ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  : <AlertCircle  className="h-3.5 w-3.5 shrink-0 text-rose-400" />}
                <span className={`text-[11px] ${ok ? "text-slate-700" : "font-semibold text-rose-600"}`}>
                  {doc.label}
                </span>
                {doc.fileName && ok && (
                  <span className="ml-auto text-[10px] text-slate-400 truncate max-w-[160px]">{doc.fileName}</span>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] text-slate-400">{conformDocs.length}/{docs.length} pièces conformes</p>
      </SectionCard>

      {/* Offre technique */}
      <SectionCard title="Offre technique" icon={<ClipboardList className="h-4 w-4" />}>
        {offreTechFile ? (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-xs font-semibold text-slate-800">{offreTechFile.name}</p>
              <p className="text-[10px] text-slate-400">{(offreTechFile.size / (1024 * 1024)).toFixed(2)} Mo</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-rose-500">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-semibold">Fichier manquant</span>
          </div>
        )}
      </SectionCard>

      {/* Offre financière */}
      <SectionCard title="Offre financière (BPU)" icon={<Lock className="h-4 w-4" />}>
        <div className="space-y-2">
          {selectedLots.map((lot) => {
            const bpu = lotBpus.find((b) => b.lotId === lot.id);
            const total = bpu ? lotTotal(bpu.lines) : 0;
            return (
              <div key={lot.id} className="flex items-center justify-between">
                <span className="text-[11px] text-slate-700">Lot {lot.lotNumber} &ndash; {lot.designation}</span>
                <span className={`text-[11px] font-bold ${total ? "text-[#364150]" : "text-slate-300"}`}>
                  {fmtDZD(total)}
                </span>
              </div>
            );
          })}
        </div>
        {selectedLots.length > 1 && (
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-[11px] font-bold text-slate-600">Total général HT</span>
            <span className="text-xs font-bold text-[#364150]">{fmtDZD(grandTotal)}</span>
          </div>
        )}
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
          <Lock className="h-3 w-3" />
          Sera chiffré E2EE (AES-256-GCM) avant transmission
        </div>
      </SectionCard>

      {/* Caution */}
      <SectionCard title="Caution bancaire" icon={<Landmark className="h-4 w-4" />}>
        {caution.reference ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <Row label="Référence"  value={caution.reference} />
            <Row label="Banque"        value={caution.banque} />
            <Row label="Montant"       value={`${caution.montant} DZD`} />
            <Row label="Expiration"    value={fmtDate(caution.expiry)} />
          </div>
        ) : (
          <p className="text-xs text-slate-400">—</p>
        )}
        {caution.file && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-600">
            <CheckCircle2 className="h-3 w-3" />{caution.file.name}
          </div>
        )}
      </SectionCard>

      {/* Declaration */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors">
        <input
          type="checkbox"
          checked={declared}
          onChange={(e) => setDeclared(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded accent-[#4CAF50]"
        />
        <p className="text-xs text-slate-700 leading-relaxed">
          Je, soussigné, certifie l&apos;exactitude de toutes les informations et documents fournis dans ce dossier de soumission.
          J&apos;atteste que mon entreprise remplit toutes les conditions d&apos;éligibilité requises et que l&apos;offre financière
          est ferme et irrévocable pendant la durée de validité de l&apos;appel d&apos;offres.
        </p>
      </label>

      <NavButtons
        onBack={onBack}
        onNext={onSubmit}
        nextLabel="Déposer la soumission"
        isLast
        disabled={!declared || missingDocs.length > 0 || !offreTechFile || !caution.reference}
      />
    </div>
  );
}