import { WizardStepProps } from "./types";
import React from "react";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Download,
  FileText,
  Trash2,
  Upload,
} from "lucide-react";
import CdcAiAssistPanel from "./CdcAiAssistPanel";
export default function Step3({ props }: { props: WizardStepProps }) {
  const {
    dict,
    stepTitles,
    getSwitchThumbClass,
    draftId,
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
    formatFileSize,
    publishCdc,
    downloadCdcFile,
  } = props;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-2xl font-bold text-slate-900">
          {dict.stepPrefix} 3: {stepTitles[2]}
        </h2>
      </div>
      <CdcAiAssistPanel
        aoId={draftId}
        dict={{
          aiTitle: dict.step3.aiTitle,
          aiDescription: dict.step3.aiDescription,
          aiButton: dict.step3.aiButton,
        }}
        onInsert={(text) => updateCdcField("title", text.split("\n")[0].slice(0, 200))}
      />
      <div className="mt-4 grid grid-cols-1 gap-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            {dict.step3.cdcTitleLabel} <span className="text-red-500">*</span>
          </label>
          <input
            value={cdcForm.title}
            onChange={(event) => updateCdcField("title", event.target.value)}
            placeholder=""
            className={cn(
              "h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-[#4CAF50]",
              cdcErrors.title
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-white",
            )}
          />
          {cdcErrors.title && (
            <p className="mt-1 text-[11px] text-red-600">{cdcErrors.title}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            {dict.step3.cdcFileLabel}
          </label>
          <label
            htmlFor="cdc-upload"
            className={cn(
              "flex min-h-[120px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center",
              cdcErrors.file
                ? "border-red-300 bg-red-50"
                : "border-slate-300 bg-slate-50 hover:bg-slate-100",
            )}
          >
            <span className="rounded-full bg-[#E8F5E9] p-2 text-[#2F9E44]">
              <Upload className="h-5 w-5" />
            </span>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              {dict.step3.uploadDropLabel}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">{dict.step3.uploadHint}</p>
          </label>
          <input
            id="cdc-upload"
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(event) =>
              handleCdcFileChange(event.target.files?.[0] ?? null)
            }
          />
          {(cdcFile || existingCdcFileName) && (
            <div className="mt-2 flex items-center justify-between rounded-md border border-[#D8EFD9] bg-[#EFF9EF] px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-700">
                  {cdcFile?.name || existingCdcFileName}
                </p>
                <p className="text-[11px] text-slate-500">
                  {cdcFile
                    ? formatFileSize(cdcFile.size)
                    : dict.step3.fileAlreadySaved}
                </p>
              </div>
              <button
                type="button"
                onClick={removeCdcFile}
                className="rounded p-1 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Supprimer le fichier CDC"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {cdcErrors.file && (
            <p className="mt-1 text-[11px] text-red-600">{cdcErrors.file}</p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
              {dict.step3.versionLabel}
            </label>
            <input
              value={cdcForm.version}
              onChange={(event) =>
                updateCdcField("version", event.target.value)
              }
              placeholder="v1.0.0"
              className={cn(
                "h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-[#4CAF50]",
                cdcErrors.version
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 bg-white",
              )}
            />
            {cdcErrors.version && (
              <p className="mt-1 text-[11px] text-red-600">
                {cdcErrors.version}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
              {dict.step3.withdrawalPriceLabel}
            </label>
            <div className="flex h-10 overflow-hidden rounded-md border border-slate-200">
              <input
                value={cdcForm.withdrawalPrice}
                onChange={(event) =>
                  updateCdcField("withdrawalPrice", event.target.value)
                }
                placeholder="0.00"
                className={cn(
                  "w-full px-3 text-sm outline-none",
                  cdcErrors.withdrawalPrice ? "bg-red-50" : "bg-white",
                )}
              />
              <span className="flex items-center bg-slate-100 px-3 text-xs font-semibold text-slate-600">
                DZD
              </span>
            </div>
            {cdcErrors.withdrawalPrice && (
              <p className="mt-1 text-[11px] text-red-600">
                {cdcErrors.withdrawalPrice}
              </p>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-700">{dict.step3.cdcStatusLabel}</p>
              <p className="text-[11px] text-slate-500">
                {cdcForm.isPublished
                  ? dict.review.statusPublished
                  : dict.review.statusUnpublished}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateCdcField("isPublished", !cdcForm.isPublished)
              }
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                cdcForm.isPublished ? "bg-[#4CAF50]" : "bg-slate-300",
              )}
              aria-label="Toggle CDC publish status"
            >
              <span
                className={cn(
                  "absolute start-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                  getSwitchThumbClass(cdcForm.isPublished),
                )}
              />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          {dict.buttons.back}
        </button>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <label
            htmlFor="cdc-upload"
            className="inline-flex h-9 cursor-pointer items-center justify-center gap-1 rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {cdcFile || existingCdcFileName
              ? dict.buttons.replaceFile
              : dict.buttons.uploadFile}
          </label>
          {cdcFile && (
            <button
              type="button"
              onClick={downloadCdcFile}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              {dict.buttons.downloadCdc}
            </button>
          )}
          <button
            type="button"
            onClick={publishCdc}
            className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <FileText className="h-3.5 w-3.5" />
            {dict.buttons.publishCdc}
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
      </div>
    </section>
  );
}
