import { WizardStepProps } from "./types";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Download,
  PencilLine,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
export default function Step3({ props }: { props: WizardStepProps }) {
  const {
    dict,
    stepTitles,
   
    cdcForm,
    updateCdcField,
    cdcFile,
    handleCdcFileChange,
    cdcCreationMode,
    setCdcCreationMode,
    aiCdcText,
    setAiCdcText,
    existingCdcFileName,
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
    downloadCdcFile,
    generateCdcDraftMutation,
  } = props;

  const [aiPrompt, setAiPrompt] = useState("");
  const isAiMode = cdcCreationMode === "ai";

  const handleGenerateAi = async () => {
    if (!generateCdcDraftMutation) return;
    
    const aoId = props.draftId;
    if (!aoId) {
      alert("Veuillez d'abord sauvegarder le brouillon (bouton 'Save as draft' en bas) avant de générer le CDC avec l'IA. L'IA a besoin que les informations soient enregistrées pour générer le document.");
      return;
    }

    try {
      const result = await generateCdcDraftMutation.mutateAsync({
        aoId,
        sectionType: "CDC_GENERAL",
        userPrompt: aiPrompt,
      });

      const content = result.correctedDraft || result.draft || "";
      setAiCdcText(content);
    } catch (err) {
      console.error("AI Generation failed", err);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-2xl font-bold text-slate-900">
          {dict.stepPrefix} 3: {stepTitles[2]}
        </h2>
      </div>
      <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setCdcCreationMode("manual")}
          className={cn(
            "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors",
            !isAiMode
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800",
          )}
        >
          <Upload className="h-3.5 w-3.5" />
          Manuel
        </button>
        <button
          type="button"
          onClick={() => {
            setAiCdcText(aiCdcText || "");
          }}
          className={cn(
            "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors",
            isAiMode
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800",
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          IA
        </button>
      </div>
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
        {!isAiMode ? (
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
              accept=".pdf,application/pdf,.txt,text/plain"
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
        ) : (
          <div className="rounded-lg border border-[#D8EFD9] bg-[#EFF9EF] p-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md bg-white/80 p-1.5 text-[#2F9E44]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {dict.step3.aiTitle}
                </p>
                <p className="mt-0.5 text-xs text-slate-600">
                  {dict.step3.aiDescription}
                </p>
                <textarea
                  className="mt-2 w-full rounded-md border border-slate-200 bg-white p-2 text-xs outline-none focus:border-[#4CAF50]"
                  placeholder="Besoins spécifiques pour ce CDC..."
                  rows={2}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={generateCdcDraftMutation?.isPending}
                  className="mt-2 inline-flex h-8 items-center justify-center rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50"
                >
                  {generateCdcDraftMutation?.isPending
                    ? "Génération en cours..."
                    : dict.step3.aiButton}
                </button>
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <PencilLine className="h-3.5 w-3.5 text-[#2F9E44]" />
                  Texte CDC généré
                </label>
                {cdcFile && (
                  <span className="text-[11px] font-medium text-slate-500">
                    {cdcFile.name} • {formatFileSize(cdcFile.size)}
                  </span>
                )}
              </div>
              <textarea
                value={aiCdcText}
                onChange={(event) => setAiCdcText(event.target.value)}
                rows={16}
                placeholder="Le texte généré par l'IA apparaîtra ici. Vous pourrez le modifier avant de passer à l'étape suivante."
                className={cn(
                  "min-h-[320px] w-full resize-y rounded-md border bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-800 outline-none focus:border-[#4CAF50] focus:bg-white",
                  cdcErrors.file ? "border-red-300" : "border-slate-200",
                )}
              />
              {cdcErrors.file && (
                <p className="mt-1 text-[11px] text-red-600">{cdcErrors.file}</p>
              )}
            </div>
          </div>
        )}
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
          {!isAiMode && (
            <label
              htmlFor="cdc-upload"
              className="inline-flex h-9 cursor-pointer items-center justify-center gap-1 rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Upload className="h-3.5 w-3.5" />
              {cdcFile || existingCdcFileName
                ? dict.buttons.replaceFile
                : dict.buttons.uploadFile}
            </label>
          )}
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
            onClick={goNextAfterValidation}
            disabled={isSubmittingAction}
            className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50"
          >
            {dict.buttons.next}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {reviewActionError && (
        <p className="mt-2 text-[11px] font-medium text-red-600">
          {reviewActionError}
        </p>
      )}
    </section>
  );
}
