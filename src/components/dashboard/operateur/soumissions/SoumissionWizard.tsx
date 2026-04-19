"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { X, CheckCircle2 } from "lucide-react";
import { type Locale } from "@/i18n/config";
import {
  type OeAoItem,
} from "@/services/operateur-appels-offres/api";
import { useOperateurAppelsOffresQuery } from "@/services/operateur-appels-offres/queries";
import { useSubmitOperateurSoumissionWorkflowMutation } from "@/services/operateur-soumissions/queries";
import {
  INITIAL_CAUTION,
  buildDefaultBpus, type WizardState, type LotBpu, type CautionData, type AoOption,
} from "./wizard-types";
import { StepIndicator } from "./wizard-ui";

import Step1SelectAo        from "./steps/Step1SelectAo";
import Step3OffreTechnique  from "./steps/Step3OffreTechnique";
import Step4OffreFinanciere from "./steps/Step4OffreFinanciere";
import Step5CautionBancaire from "./steps/Step5CautionBancaire";
import Step5Review          from "./steps/Step5Review";

// ─── Success screen ───────────────────────────────────────────────────────────

function toAoOption(ao: OeAoItem): AoOption {
  return {
    id: ao.id,
    reference: ao.reference,
    object: ao.object,
    type: ao.type,
    status: ao.status,
    organizationName: ao.organizationName,
    wilaya: ao.wilaya,
    deadline: ao.deadline,
    lots: ao.lots,
  };
}

function SuccessScreen({
  reference,
  horodatage,
  onDone,
}: {
  reference: string;
  horodatage?: string;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-9 w-9 text-[#4CAF50]" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">Soumission déposée avec succès&nbsp;!</h2>
      <p className="mt-2 max-w-sm text-xs text-slate-500">
        Votre offre <span className="font-semibold">{reference}</span> a été reçue, horodatée et chiffrée.
        Un accusé de réception vous sera envoyé par notification.
      </p>
      {horodatage && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[11px] text-emerald-700">
          Horodatage serveur : {new Date(horodatage).toLocaleString("fr-DZ")}
        </div>
      )}
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) || "fr";
  const { data: aoItems = [], isLoading: isLoadingAos, isError: isErrorAos } = useOperateurAppelsOffresQuery();
  const submitMutation = useSubmitOperateurSoumissionWorkflowMutation();

  const aoOptions = useMemo(() => aoItems.map(toAoOption), [aoItems]);
  const prefillAoId = searchParams.get("aoId") || "";
  const prefillLotId = searchParams.get("lotId") || "";

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [done, setDone] = useState<{ reference: string; horodatage?: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [prefillApplied, setPrefillApplied] = useState(false);

  const [state, setState] = useState<WizardState>({
    selectedAoId: "",
    selectedLotId: "",
    docs: [],
    offreTechFile: null,
    lotBpus: [],
    caution: INITIAL_CAUTION,
  });

  useEffect(() => {
    if (prefillApplied || isLoadingAos) {
      return;
    }

    if (!prefillAoId) {
      setPrefillApplied(true);
      return;
    }

    const ao = aoOptions.find((entry) => entry.id === prefillAoId);
    if (!ao) {
      setPrefillApplied(true);
      return;
    }

    const resolvedLotId = ao.lots.some((lot) => lot.id === prefillLotId)
      ? prefillLotId
      : (ao.lots[0]?.id || "");

    setState((previous) => ({
      ...previous,
      selectedAoId: ao.id,
      selectedLotId: resolvedLotId,
      lotBpus: resolvedLotId ? buildDefaultBpus([resolvedLotId], ao.lots) : [],
    }));

    if (resolvedLotId) {
      setStep(2);
    }

    setPrefillApplied(true);
  }, [prefillApplied, isLoadingAos, prefillAoId, prefillLotId, aoOptions]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSelectAo = useCallback((id: string) => {
    const ao = aoOptions.find((entry) => entry.id === id);
    setSubmitError(null);
    setState((s) => ({
      ...s,
      selectedAoId: id,
      selectedLotId: "",
      lotBpus: ao ? buildDefaultBpus([], ao.lots) : [],
    }));
  }, [aoOptions]);

  const handleSelectLot = useCallback((lotId: string) => {
    setSubmitError(null);
    setState((s) => {
      const ao = aoOptions.find((entry) => entry.id === s.selectedAoId);
      if (!ao) {
        return s;
      }

      const currentBpu = s.lotBpus.find((entry) => entry.lotId === lotId);

      return {
        ...s,
        selectedLotId: lotId,
        lotBpus: currentBpu ? [currentBpu] : buildDefaultBpus([lotId], ao.lots),
      };
    });
  }, [aoOptions]);

  const setTechFile = (f: File)             => {
    setSubmitError(null);
    setState((s) => ({ ...s, offreTechFile: f }));
  };
  const setBpus     = (lotBpus: LotBpu[])   => {
    setSubmitError(null);
    setState((s) => ({ ...s, lotBpus }));
  };
  const setCaution  = (caution: CautionData)=> {
    setSubmitError(null);
    setState((s) => ({ ...s, caution }));
  };

  const go = (n: 1 | 2 | 3 | 4 | 5) => setStep(n);

  const selectedAo = aoOptions.find((entry) => entry.id === state.selectedAoId) || null;

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);

    if (!selectedAo) {
      setSubmitError("Selectionnez un appel d'offres avant de deposer.");
      return;
    }

    const selectedLot = selectedAo.lots.find((lot) => lot.id === state.selectedLotId);
    if (!selectedLot) {
      setSubmitError("Selectionnez un lot valide pour continuer.");
      return;
    }

    if (!state.offreTechFile) {
      setSubmitError("Le fichier de l'offre technique est obligatoire.");
      return;
    }

    const selectedBpu = state.lotBpus.find((entry) => entry.lotId === selectedLot.id);
    if (!selectedBpu || !selectedBpu.lines.length) {
      setSubmitError("Renseignez l'offre financiere pour le lot selectionne.");
      return;
    }

    if (
      !state.caution.file
      || !state.caution.reference.trim()
      || !state.caution.banque.trim()
      || !state.caution.montant.trim()
      || !state.caution.emission
      || !state.caution.expiry
    ) {
      setSubmitError("Les informations de caution bancaire sont incompletes.");
      return;
    }

    try {
      const result = await submitMutation.mutateAsync({
        appelOffreId: selectedAo.id,
        lotId: selectedLot.id,
        offreTechniqueFile: state.offreTechFile,
        financialLots: [{
          lotId: selectedLot.id,
          lotNumber: selectedLot.lotNumber,
          designation: selectedLot.designation,
          lines: selectedBpu.lines.map((line) => ({
            designation: line.designation,
            unite: line.unite,
            quantite: line.quantite,
            prixUnitaire: line.prixUnitaire,
          })),
        }],
        caution: {
          montant: state.caution.montant,
          banque: state.caution.banque,
          reference: state.caution.reference,
          dateEmission: state.caution.emission,
          dateExpiration: state.caution.expiry,
          scanFile: state.caution.file,
        },
      });

      setDone({
        reference: result.reference,
        horodatage: result.horodatageServeur,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Le depot a echoue. Veuillez reessayer.");
    }
  }, [selectedAo, state, submitMutation]);

  if (done) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <SuccessScreen
            reference={done.reference}
            horodatage={done.horodatage}
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
              étape {step}/5{selectedAo ? ` — ${selectedAo.reference}` : ""}
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
            aoOptions={aoOptions}
            selectedAoId={state.selectedAoId}
            selectedLotId={state.selectedLotId}
            isLoadingAos={isLoadingAos}
            isErrorAos={isErrorAos}
            onSelectAo={handleSelectAo}
            onSelectLot={handleSelectLot}
            onNext={() => go(2)}
          />
        )}
        {step === 2 && (
          <Step3OffreTechnique
            selectedAo={selectedAo}
            selectedLotId={state.selectedLotId}
            offreTechFile={state.offreTechFile}
            onFileChange={setTechFile}
            onBack={() => go(1)}
            onNext={() => go(3)}
          />
        )}
        {step === 3 && (
          <Step4OffreFinanciere
            selectedAo={selectedAo}
            selectedLotId={state.selectedLotId}
            lotBpus={state.lotBpus}
            onChange={setBpus}
            onBack={() => go(2)}
            onNext={() => go(4)}
          />
        )}
        {step === 4 && (
          <Step5CautionBancaire
            caution={state.caution}
            onChange={setCaution}
            onBack={() => go(3)}
            onNext={() => go(5)}
          />
        )}
        {step === 5 && (
          <Step5Review
            selectedAo={selectedAo}
            selectedLotId={state.selectedLotId}
            offreTechFile={state.offreTechFile}
            lotBpus={state.lotBpus}
            caution={state.caution}
            isSubmitting={submitMutation.isPending}
            submitError={submitError}
            onBack={() => go(4)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}