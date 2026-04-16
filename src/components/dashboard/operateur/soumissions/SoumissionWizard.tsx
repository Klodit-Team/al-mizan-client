"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, CheckCircle2 } from "lucide-react";
import { type Locale } from "@/i18n/config";
import {
  AO_OPTIONS, INITIAL_DOCS, INITIAL_CAUTION,
  buildDefaultBpus, type WizardState, type AdminDoc, type LotBpu, type CautionData,
} from "./wizard-types";
import { StepIndicator } from "./wizard-ui";

import Step1SelectAo        from "./steps/Step1SelectAo";
import Step2AdminDocs       from "./steps/Step2AdminDocs";
import Step3OffreTechnique  from "./steps/Step3OffreTechnique";
import Step4OffreFinanciere from "./steps/Step4OffreFinanciere";
import Step5CautionBancaire from "./steps/Step5CautionBancaire";
import Step6Review          from "./steps/Step6Review";

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ aoRef, onDone }: { aoRef: string; onDone: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-9 w-9 text-[#4CAF50]" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">Soumission déposée avec succès&nbsp;!</h2>
      <p className="mt-2 max-w-sm text-xs text-slate-500">
        Votre offre pour <span className="font-semibold">{aoRef}</span> a été reçue, horodatée et chiffrée.
        Un accusé de réception vous sera envoyé par notification.
      </p>
      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[11px] font-mono text-emerald-700">
        SHA-256 : a3f9b2c1d8e4f7a0b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7
      </div>
      <button type="button" onClick={onDone}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#4CAF50] px-5 py-2.5 text-sm font-semibold text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transition-colors">
        Voir mes soumissions
      </button>
    </div>
  );
}

// ─── Wizard ───────────────────────────────────────────────────────────────────

export default function SoumissionWizard() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) || "fr";

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [done, setDone] = useState(false);

  const [state, setState] = useState<WizardState>({
    selectedAoId:  "",
    selectedLotIds: [],
    docs:          INITIAL_DOCS,
    offreTechFile: null,
    lotBpus:       [],
    caution:       INITIAL_CAUTION,
  });

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSelectAo = useCallback((id: string) => {
    const ao = AO_OPTIONS.find((a) => a.id === id);
    setState((s) => ({
      ...s,
      selectedAoId: id,
      selectedLotIds: [],
      lotBpus: ao ? buildDefaultBpus([], ao.lots) : [],
    }));
  }, []);

  const handleToggleLot = useCallback((lotId: string) => {
    setState((s) => {
      const ao = AO_OPTIONS.find((a) => a.id === s.selectedAoId);
      const newIds = s.selectedLotIds.includes(lotId)
        ? s.selectedLotIds.filter((x) => x !== lotId)
        : [...s.selectedLotIds, lotId];
      return {
        ...s,
        selectedLotIds: newIds,
        lotBpus: ao ? buildDefaultBpus(newIds, ao.lots) : [],
      };
    });
  }, []);

  const handleDocUpload = useCallback((id: string, file: File) => {
    setState((s) => ({
      ...s,
      docs: s.docs.map((d) => d.id === id ? { ...d, status: "uploade", fileName: file.name } : d),
    }));
  }, []);

  const setDocs     = (docs: AdminDoc[])    => setState((s) => ({ ...s, docs }));
  const setTechFile = (f: File)             => setState((s) => ({ ...s, offreTechFile: f }));
  const setBpus     = (lotBpus: LotBpu[])   => setState((s) => ({ ...s, lotBpus }));
  const setCaution  = (caution: CautionData)=> setState((s) => ({ ...s, caution }));

  const go = (n: 1 | 2 | 3 | 4 | 5 | 6) => setStep(n);

  const selectedAo = AO_OPTIONS.find((a) => a.id === state.selectedAoId);

  if (done) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <SuccessScreen
            aoRef={selectedAo?.reference ?? ""}
            onDone={() => router.push(`/${locale}/dashboard/operateur/soumissions`)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {/* Header */}
      <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold uppercase tracking-[0.03em] text-slate-900">Nouvelle Soumission</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              étape {step}/6{selectedAo ? ` — ${selectedAo.reference}` : ""}
            </p>
          </div>
          <button type="button"
            onClick={() => router.push(`/${locale}/dashboard/operateur/soumissions`)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-rose-500 transition-colors">
            <X className="h-3.5 w-3.5" />Annuler
          </button>
        </div>
        <StepIndicator step={step} />
      </header>

      {/* Step content */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {step === 1 && (
          <Step1SelectAo
            selectedAoId={state.selectedAoId}
            selectedLotIds={state.selectedLotIds}
            onSelectAo={handleSelectAo}
            onToggleLot={handleToggleLot}
            onNext={() => go(2)}
          />
        )}
        {step === 2 && (
          <Step2AdminDocs
            docs={state.docs}
            onUpload={handleDocUpload}
            onBack={() => go(1)}
            onNext={() => go(3)}
          />
        )}
        {step === 3 && (
          <Step3OffreTechnique
            selectedAoId={state.selectedAoId}
            selectedLotIds={state.selectedLotIds}
            offreTechFile={state.offreTechFile}
            onFileChange={setTechFile}
            onBack={() => go(2)}
            onNext={() => go(4)}
          />
        )}
        {step === 4 && (
          <Step4OffreFinanciere
            selectedAoId={state.selectedAoId}
            selectedLotIds={state.selectedLotIds}
            lotBpus={state.lotBpus}
            onChange={setBpus}
            onBack={() => go(3)}
            onNext={() => go(5)}
          />
        )}
        {step === 5 && (
          <Step5CautionBancaire
            caution={state.caution}
            onChange={setCaution}
            onBack={() => go(4)}
            onNext={() => go(6)}
          />
        )}
        {step === 6 && (
          <Step6Review
            selectedAoId={state.selectedAoId}
            selectedLotIds={state.selectedLotIds}
            docs={state.docs}
            offreTechFile={state.offreTechFile}
            lotBpus={state.lotBpus}
            caution={state.caution}
            onBack={() => go(5)}
            onSubmit={() => setDone(true)}
          />
        )}
      </div>
    </div>
  );
}