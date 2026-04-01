import { WizardStepProps } from "./types";
import React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
export default function Step1({ props }: { props: WizardStepProps }) {
  const {
    dict,
    stepTitles,
    getSwitchThumbClass,
    form,
    updateField,
    errors,
    lots,
    setLots,
    lotForm,
    setLotForm,
    showLotForm,
    setShowLotForm,
    editingLotId,
    setEditingLotId,
    saveLot,
    editLot,
    deleteLot,
    lotErrors,
    cdcForm,
    setCdcForm,
    updateCdcField,
    cdcFile,
    handleCdcFileChange,
    existingCdcFileName,
    setExistingCdcFileName,
    triggerCdcFileInput,
    removeCdcFile,
    cdcErrors,
    criteria,
    setCriteria,
    showCriterionForm,
    setShowCriterionForm,
    criterionForm,
    setCriterionForm,
    editingCriterionId,
    setEditingCriterionId,
    saveCriterion,
    editCriterion,
    deleteCriterion,
    moveCriterionUp,
    moveCriterionDown,
    criterionErrors,
    evaluationCriteria,
    setEvaluationCriteria,
    showEvaluationForm,
    setShowEvaluationForm,
    evaluationForm,
    setEvaluationForm,
    editingEvaluationId,
    setEditingEvaluationId,
    evaluationTab,
    setEvaluationTab,
    evaluationErrors,
    saveEvaluationCriterion,
    editEvaluationCriterion,
    deleteEvaluationCriterion,
    moveEvaluationCriterionUp,
    moveEvaluationCriterionDown,
    evaluationStepError,
    goBack,
    goNextAfterValidation,
    isSubmittingAction,
    saveReviewDraft,
    reviewActionError,
    reviewActionMessage,
    generatedAvisRef,
    step,
    isRtl,
    fileInputRef,
    setEvaluationStepError,
    saveDraft,
    savedDraft,
  } = props;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-2xl font-bold text-slate-900">
          {dict.stepPrefix} 1: {stepTitles[0]}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            Reference (Auto-generee)
          </label>
          <input
            value={form.reference}
            readOnly
            className="h-10 w-full rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            Objet de l&apos;AO
          </label>
          <input
            value={form.object}
            onChange={(event) => updateField("object", event.target.value)}
            placeholder="Ex. Acquisition de materiel informatique"
            className={cn(
              "h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-[#4CAF50]",
              errors.object
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-white",
            )}
          />
          {errors.object && (
            <p className="mt-1 text-[11px] text-red-600">{errors.object}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            Description detaillee
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Decrivez les besoins et les specifications techniques principales..."
            className={cn(
              "w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-[#4CAF50]",
              errors.description
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-white",
            )}
          />
          {errors.description && (
            <p className="mt-1 text-[11px] text-red-600">
              {errors.description}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            Type de marche
          </label>
          <select
            value={form.marketType}
            onChange={(event) => updateField("marketType", event.target.value)}
            className={cn(
              "h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-[#4CAF50]",
              errors.marketType
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-white",
            )}
          >
            <option value="">Selectionner un type</option>
            <option value="fournitures">Fournitures</option>
            <option value="services">Services</option>
            <option value="travaux">Travaux</option>
          </select>
          {errors.marketType && (
            <p className="mt-1 text-[11px] text-red-600">{errors.marketType}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            Type d&apos;appel
          </label>
          <select
            value={form.procedureType}
            onChange={(event) =>
              updateField("procedureType", event.target.value)
            }
            className={cn(
              "h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-[#4CAF50]",
              errors.procedureType
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-white",
            )}
          >
            <option value="">Selectionner une procedure</option>
            <option value="ouvert">Ouvert</option>
            <option value="restreint">Restreint</option>
            <option value="gre_a_gre">Gre a gre</option>
          </select>
          {errors.procedureType && (
            <p className="mt-1 text-[11px] text-red-600">
              {errors.procedureType}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            Montant estime (DZD)
          </label>
          <div className="flex h-10 overflow-hidden rounded-md border border-slate-200">
            <input
              value={form.estimatedAmount}
              onChange={(event) =>
                updateField("estimatedAmount", event.target.value)
              }
              placeholder="0.00"
              className={cn(
                "w-full px-3 text-sm outline-none",
                errors.estimatedAmount ? "bg-red-50" : "bg-white",
              )}
            />
            <span className="flex items-center bg-slate-100 px-3 text-xs font-semibold text-slate-600">
              DZD
            </span>
          </div>
          {errors.estimatedAmount && (
            <p className="mt-1 text-[11px] text-red-600">
              {errors.estimatedAmount}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            Wilaya d&apos;execution
          </label>
          <input
            value={form.executionWilaya}
            onChange={(event) =>
              updateField("executionWilaya", event.target.value)
            }
            placeholder="Saisir la wilaya"
            className={cn(
              "h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-[#4CAF50]",
              errors.executionWilaya
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-white",
            )}
          />
          {errors.executionWilaya && (
            <p className="mt-1 text-[11px] text-red-600">
              {errors.executionWilaya}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            Delai d&apos;execution (jours)
          </label>
          <input
            value={form.executionDelayDays}
            onChange={(event) =>
              updateField("executionDelayDays", event.target.value)
            }
            placeholder="Ex. 90"
            className={cn(
              "h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-[#4CAF50]",
              errors.executionDelayDays
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-white",
            )}
          />
          {errors.executionDelayDays && (
            <p className="mt-1 text-[11px] text-red-600">
              {errors.executionDelayDays}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-slate-700">
            Caution de soumission
          </p>
          <button
            type="button"
            onClick={() =>
              updateField(
                "submissionBondRequired",
                !form.submissionBondRequired,
              )
            }
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              form.submissionBondRequired ? "bg-[#4CAF50]" : "bg-slate-300",
            )}
            aria-label="Toggle caution requise"
          >
            <span
              className={cn(
                "absolute start-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                getSwitchThumbClass(form.submissionBondRequired),
              )}
            />
          </button>
        </div>
        <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
          Montant de la caution (DZD)
        </label>
        <input
          value={form.submissionBondAmount}
          onChange={(event) =>
            updateField("submissionBondAmount", event.target.value)
          }
          placeholder="Ex. 500,000.00"
          disabled={!form.submissionBondRequired}
          className={cn(
            "h-10 w-full rounded-md border px-3 text-sm outline-none",
            !form.submissionBondRequired
              ? "border-slate-200 bg-slate-100 text-slate-400"
              : errors.submissionBondAmount
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-white focus:border-[#4CAF50]",
          )}
        />
        {errors.submissionBondAmount && (
          <p className="mt-1 text-[11px] text-red-600">
            {errors.submissionBondAmount}
          </p>
        )}
      </div>
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="mb-3 text-xs font-semibold text-slate-700">
          Echeances cles
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] text-slate-600">
              Date limite retrait DCE
            </label>
            <input
              type="date"
              value={form.dceDeadline}
              onChange={(event) =>
                updateField("dceDeadline", event.target.value)
              }
              className={cn(
                "h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-[#4CAF50]",
                errors.dceDeadline
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 bg-white",
              )}
            />
            {errors.dceDeadline && (
              <p className="mt-1 text-[11px] text-red-600">
                {errors.dceDeadline}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-slate-600">
              Date limite depot offres
            </label>
            <input
              type="date"
              value={form.offerDeadline}
              onChange={(event) =>
                updateField("offerDeadline", event.target.value)
              }
              className={cn(
                "h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-[#4CAF50]",
                errors.offerDeadline
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 bg-white",
              )}
            />
            {errors.offerDeadline && (
              <p className="mt-1 text-[11px] text-red-600">
                {errors.offerDeadline}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-slate-600">
              Date ouverture des plis
            </label>
            <input
              type="date"
              value={form.openingDate}
              onChange={(event) =>
                updateField("openingDate", event.target.value)
              }
              className={cn(
                "h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-[#4CAF50]",
                errors.openingDate
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 bg-white",
              )}
            />
            {errors.openingDate && (
              <p className="mt-1 text-[11px] text-red-600">
                {errors.openingDate}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col-reverse gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={saveDraft}
          disabled={isSubmittingAction}
          className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          {dict.buttons.saveDraft}
        </button>
        <button
          type="button"
          onClick={goNextAfterValidation}
          className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95"
        >
          {dict.buttons.next}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      {savedDraft && (
        <p className="mt-2 text-[11px] font-medium text-emerald-700">
          {dict.messages.draftSaved}
        </p>
      )}
    </section>
  );
}
