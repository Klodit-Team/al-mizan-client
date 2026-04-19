"use client";

import { ClipboardList } from "lucide-react";
import { type AoLot, type AoOption } from "../wizard-types";
import { SectionTitle, NavButtons, FileDropzone } from "../wizard-ui";

interface Props {
  selectedAo: AoOption | null;
  selectedLotId: string;
  offreTechFile: File | null;
  onFileChange: (f: File) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step3OffreTechnique({
  selectedAo, selectedLotId, offreTechFile, onFileChange, onBack, onNext,
}: Props) {
  const selectedLots: AoLot[] = selectedAo?.lots.filter((lot) => lot.id === selectedLotId) ?? [];

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Offre technique"
        subtitle="Deposez votre offre technique : le cahier des charges dument rempli, signe et cachete pour le lot selectionne."
      />

      {selectedAo && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Lots concernes - {selectedAo.reference}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selectedLots.map((lot) => (
              <span key={lot.id} className="inline-flex rounded-full bg-[#4CAF50]/10 px-2 py-px text-[10px] font-semibold text-[#4CAF50]">
                Lot {lot.lotNumber} - {lot.designation}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-2">
          <ClipboardList className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-blue-800 mb-1.5">Contenu attendu du dossier technique</p>
            <ul className="space-y-1">
              {[
                "Cahier des charges rempli et paraphe page par page",
                "Memoire technique justifiant les moyens humains et materiels",
                "References de realisations similaires (si exige)",
                "Planning previsionnel d'execution",
                "Organigramme de l'equipe projet",
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[11px] text-blue-700">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
          Fichier de l'offre technique <span className="text-rose-500">*</span>
        </p>
        <FileDropzone
          label="Deposer le dossier technique (PDF)"
          sublabel="Document unique regroupant toutes les pieces techniques - PDF, max 50 Mo"
          file={offreTechFile}
          onFile={onFileChange}
          accept=".pdf"
        />
      </div>

      {offreTechFile && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <ClipboardList className="h-4 w-4 text-emerald-600" />
          <div>
            <p className="text-[11px] font-semibold text-emerald-700">{offreTechFile.name}</p>
            <p className="text-[10px] text-emerald-600">
              {(offreTechFile.size / (1024 * 1024)).toFixed(2)} Mo - Pret a etre soumis
            </p>
          </div>
        </div>
      )}

      <NavButtons onBack={onBack} onNext={onNext} disabled={!offreTechFile} />
    </div>
  );
}
