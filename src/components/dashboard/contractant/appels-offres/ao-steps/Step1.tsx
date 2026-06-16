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
   
    goNextAfterValidation,
    isSubmittingAction,
   
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
            {dict.step1.referenceLabel}
          </label>
          <input
            value={form.reference}
            readOnly
            className="h-10 w-full rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            {dict.step1.objectLabel}
          </label>
          <input
            value={form.object}
            onChange={(event) => updateField("object", event.target.value)}
            placeholder={dict.step1.objectPlaceholder}
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
            {dict.step1.descriptionLabel}
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder={dict.step1.descriptionPlaceholder}
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
            {dict.step1.marketTypeLabel}
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
            <option value="">{dict.step1.marketTypePlaceholder}</option>
            <option value="fournitures">{dict.step1.marketTypes.fournitures}</option>
            <option value="services">{dict.step1.marketTypes.services}</option>
            <option value="travaux">{dict.step1.marketTypes.travaux}</option>
          </select>
          {errors.marketType && (
            <p className="mt-1 text-[11px] text-red-600">{errors.marketType}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            {dict.step1.procedureTypeLabel}
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
            <option value="">{dict.step1.procedureTypePlaceholder}</option>
            <option value="ouvert">{dict.step1.procedureTypes.ouvert}</option>
            <option value="restreint">{dict.step1.procedureTypes.restreint}</option>
            <option value="gre_a_gre">{dict.step1.procedureTypes.greAgre}</option>
          </select>
          {errors.procedureType && (
            <p className="mt-1 text-[11px] text-red-600">
              {errors.procedureType}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            {dict.step1.estimatedAmountLabel}
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
              {dict.currency}
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
            {dict.step1.wilayaLabel}
          </label>
          <input
            value={form.executionWilaya}
            onChange={(event) =>
              updateField("executionWilaya", event.target.value)
            }
            placeholder={dict.step1.wilayaPlaceholder}
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
            {dict.step1.executionDelayLabel}
          </label>
          <input
            value={form.executionDelayDays}
            onChange={(event) =>
              updateField("executionDelayDays", event.target.value)
            }
            placeholder={dict.step1.executionDelayPlaceholder}
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
            {dict.step1.submissionBondTitle}
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
          {dict.step1.submissionBondAmountLabel}
        </label>
        <input
          value={form.submissionBondAmount}
          onChange={(event) =>
            updateField("submissionBondAmount", event.target.value)
          }
          placeholder={dict.step1.submissionBondPlaceholder}
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
          {dict.step1.deadlinesTitle}
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] text-slate-600">
              {dict.step1.dceDeadlineLabel}
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
              {dict.step1.offerDeadlineLabel}
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
              {dict.step1.openingDateLabel}
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
          disabled={isSubmittingAction}
          className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50"
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
      {props.reviewActionError && (
        <p className="mt-2 text-[11px] font-medium text-red-600">
          {props.reviewActionError}
        </p>
      )}
    </section>
  );
}
