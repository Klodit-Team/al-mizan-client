import { WizardStepProps } from "./types";
import React from "react";
import { cn } from "@/lib/utils";
import { Check, Download } from "lucide-react";

type ReviewLot = {
  id: string;
  lotNumber: string;
  designation: string;
  delayDays: string;
};

type ReviewScoringItem = {
  id: string;
  label: string;
  weight: number;
};

type ReviewEligibilityItem = {
  eliminatory: boolean;
};

export default function Step6({ props }: { props: WizardStepProps }) {
  const {
    dict,
    form,
    lots,
    cdcForm,
    cdcFile,
    existingCdcFileName,
    criteria,
    scoringSummary,
    totalEvaluationWeight,
    reviewChecks,
    isSubmittingAction,
    reviewActionError,
    reviewActionMessage,
    generatedAvisRef,
    aoStatus,
    setStep,
    goBack,
    saveReviewDraft,
    publishAo,
    downloadCdcFile,
    formatFileSize,
  } = props;

  const safeReviewChecks =
    reviewChecks ??
    ({
      generalInfoComplete: false,
      hasLots: false,
      cdcUploaded: false,
      criteriaWeightValid: false,
      datesCoherent: false,
      eligibilityComplete: false,
    } as const);

  const reviewLots = lots as ReviewLot[];
  const reviewScoringSummary = scoringSummary as ReviewScoringItem[];
  const reviewEligibilityCriteria = criteria as ReviewEligibilityItem[];

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {dict.review.title}
              </h2>
              <p className="text-xs text-slate-500">{dict.review.subtitle}</p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                aoStatus === "PUBLIE"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700",
              )}
            >
              {aoStatus === "PUBLIE"
                ? dict.review.statusPublished
                : dict.review.statusUnpublished}
            </span>
          </div>

          <div className="rounded-lg border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-sm font-semibold text-slate-800">
                {dict.review.generalInfo}
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] font-semibold text-[#2F9E44] hover:underline"
              >
                Modifier
              </button>
            </div>
            <dl className="grid grid-cols-1 gap-y-2 px-3 py-3 text-xs md:grid-cols-2 md:gap-x-4">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">AO Name</dt>
                <dd className="font-semibold text-slate-800">
                  {form.object || "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Category</dt>
                <dd className="font-semibold text-slate-800 capitalize">
                  {form.marketType || "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Duration</dt>
                <dd className="font-semibold text-slate-800">
                  {form.executionDelayDays
                    ? `${form.executionDelayDays} jours`
                    : "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Estimated Value</dt>
                <dd className="font-semibold text-slate-800">
                  {form.estimatedAmount ? `${form.estimatedAmount} DZD` : "-"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Lots et specifications
            </p>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-[11px] font-semibold text-[#2F9E44] hover:underline"
            >
              Modifier
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-140 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-2">Lot ID</th>
                  <th className="px-2 py-2">Description</th>
                  <th className="px-2 py-2">Quantity/Delay</th>
                </tr>
              </thead>
              <tbody>
                {reviewLots.length === 0 ? (
                  <tr className="text-xs text-slate-500">
                    <td colSpan={3} className="px-2 py-5 text-center">
                      Aucun lot ajoute.
                    </td>
                  </tr>
                ) : (
                  reviewLots.map((lot) => (
                    <tr
                      key={lot.id}
                      className="border-b border-slate-100 text-xs text-slate-700"
                    >
                      <td className="px-2 py-2 font-semibold">
                        LOT-{lot.lotNumber}
                      </td>
                      <td className="px-2 py-2">{lot.designation}</td>
                      <td className="px-2 py-2">{lot.delayDays} jours</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Criteres de notation
            </p>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="text-[11px] font-semibold text-[#2F9E44] hover:underline"
            >
              Modifier
            </button>
          </div>

          <div className="space-y-2">
            {reviewScoringSummary.length === 0 ? (
              <p className="text-xs text-slate-500">
                Aucun critere d&apos;evaluation.
              </p>
            ) : (
              reviewScoringSummary.map((item) => (
                <div key={item.id}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-700">
                      {item.label}
                    </span>
                    <span className="font-semibold text-[#2F9E44]">
                      {item.weight}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-[#4CAF50]"
                      style={{ width: `${Math.min(100, item.weight)}%` }}
                    />
                  </div>
                </div>
              ))
            )}

            <div className="mt-3 flex items-center justify-between rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs">
              <span className="font-semibold text-slate-700">
                Ponderation totale
              </span>
              <span className="font-bold text-[#2F9E44]">
                {(Math.round(totalEvaluationWeight * 100) / 100).toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700">
                Regles d&apos;eligibilite
              </span>
              <span className="text-slate-600">
                {reviewEligibilityCriteria.length} criteres
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {
                reviewEligibilityCriteria.filter((item) => item.eliminatory)
                  .length
              }{" "}
              regles eliminatoires actives.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-slate-800">
            {dict.review.validationChecks}
          </p>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2">
              <Check
                className={cn(
                  "mt-0.5 h-3.5 w-3.5",
                  safeReviewChecks.generalInfoComplete
                    ? "text-[#2F9E44]"
                    : "text-slate-300",
                )}
              />
              <div>
                <p className="font-semibold text-slate-700">
                  Informations generales
                </p>
                <p className="text-slate-500">
                  Tous les champs obligatoires sont renseignes.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Check
                className={cn(
                  "mt-0.5 h-3.5 w-3.5",
                  safeReviewChecks.hasLots
                    ? "text-[#2F9E44]"
                    : "text-slate-300",
                )}
              />
              <div>
                <p className="font-semibold text-slate-700">Lots configures</p>
                <p className="text-slate-500">Au moins un lot est requis.</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Check
                className={cn(
                  "mt-0.5 h-3.5 w-3.5",
                  safeReviewChecks.cdcUploaded
                    ? "text-[#2F9E44]"
                    : "text-slate-300",
                )}
              />
              <div>
                <p className="font-semibold text-slate-700">CDC Uploaded</p>
                <p className="text-slate-500">
                  Le document des specifications est present.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Check
                className={cn(
                  "mt-0.5 h-3.5 w-3.5",
                  safeReviewChecks.criteriaWeightValid
                    ? "text-[#2F9E44]"
                    : "text-slate-300",
                )}
              />
              <div>
                <p className="font-semibold text-slate-700">
                  Calcul de ponderation
                </p>
                <p className="text-slate-500">
                  La somme des criteres doit etre egale a 100%.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Check
                className={cn(
                  "mt-0.5 h-3.5 w-3.5",
                  safeReviewChecks.datesCoherent
                    ? "text-[#2F9E44]"
                    : "text-slate-300",
                )}
              />
              <div>
                <p className="font-semibold text-slate-700">
                  Coherence des dates
                </p>
                <p className="text-slate-500">
                  Les dates suivent un ordre chronologique logique.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Check
                className={cn(
                  "mt-0.5 h-3.5 w-3.5",
                  safeReviewChecks.eligibilityComplete
                    ? "text-[#2F9E44]"
                    : "text-slate-300",
                )}
              />
              <div>
                <p className="font-semibold text-slate-700">
                  Criteres d&apos;eligibilite
                </p>
                <p className="text-slate-500">
                  Au moins un critere d&apos;eligibilite est requis.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-slate-800">
            Document CDC
          </p>
          {cdcFile || existingCdcFileName ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="truncate text-xs font-semibold text-slate-700">
                {cdcFile?.name || existingCdcFileName}
              </p>
              <p className="text-[11px] text-slate-500">
                {cdcFile
                  ? formatFileSize(cdcFile.size)
                  : "Fichier deja enregistre"}
              </p>
              {cdcFile && (
                <button
                  type="button"
                  onClick={downloadCdcFile}
                  className="mt-2 inline-flex h-7 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-3 w-3" />
                  {dict.buttons.downloadCdc}
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Aucun fichier CDC.</p>
          )}
          <div className="mt-2 text-[11px] text-slate-500">
            Version:{" "}
            <span className="font-semibold text-slate-700">
              {cdcForm.version || "-"}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={publishAo}
            disabled={isSubmittingAction}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#4CAF50] px-3 text-sm font-semibold text-white hover:opacity-95"
          >
            {dict.buttons.publishAo}
          </button>

          <button
            type="button"
            onClick={saveReviewDraft}
            disabled={isSubmittingAction}
            className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {dict.buttons.saveAsDraft}
          </button>

          <button
            type="button"
            onClick={goBack}
            className="mt-2 inline-flex h-9 w-full items-center justify-center rounded-md text-xs font-semibold text-slate-500 hover:bg-slate-50"
          >
            {dict.buttons.back}
          </button>

          {generatedAvisRef && (
            <p className="mt-3 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700">
              Avis genere: {generatedAvisRef}
            </p>
          )}
        </div>

        {reviewActionError && (
          <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600">
            {reviewActionError}
          </p>
        )}

        {reviewActionMessage && (
          <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700">
            {reviewActionMessage}
          </p>
        )}
      </div>
    </section>
  );
}
