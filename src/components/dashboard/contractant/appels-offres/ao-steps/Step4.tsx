import { WizardStepProps } from "./types";
import React from "react";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
export default function Step4({ props }: { props: WizardStepProps }) {
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
    openCreateCriterionForm,
    moveCriterion,
    toggleCriterionEliminatory,
    updateCriterionField,
    cancelCriterionEdit,
    openEditCriterionForm,
  } = props;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-2xl font-bold text-slate-900">
          {dict.stepPrefix} 4: {stepTitles[3]}
        </h2>
      </div>
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Criteres d&apos;Eligibilite
          </h3>
          <p className="text-xs text-slate-500">
            Definissez les conditions obligatoires de participation
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateCriterionForm}
          className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter critere
        </button>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">Ordre</th>
              <th className="px-2 py-2">Designation</th>
              <th className="px-2 py-2">Description</th>
              <th className="px-2 py-2">Eliminatoire</th>
              <th className="px-2 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {criteria.length === 0 ? (
              <tr className="text-xs text-slate-500">
                <td colSpan={5} className="px-2 py-6 text-center">
                  Aucun critere defini pour le moment.
                </td>
              </tr>
            ) : (
              criteria.map((criterion: any, index: number) => (
                <tr
                  key={criterion.id}
                  className="border-b border-slate-100 text-xs text-slate-700"
                >
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {criterion.order}
                      </span>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => moveCriterion(criterion.id, "up")}
                          disabled={index === 0}
                          className="rounded p-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Monter le critere"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveCriterion(criterion.id, "down")}
                          disabled={index === criteria.length - 1}
                          className="rounded p-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Descendre le critere"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-sm font-semibold text-slate-800">
                    {criterion.designation}
                  </td>
                  <td className="max-w-[320px] px-2 py-3 text-slate-600">
                    {criterion.description}
                  </td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      onClick={() => toggleCriterionEliminatory(criterion.id)}
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        criterion.eliminatory ? "bg-[#4CAF50]" : "bg-slate-300",
                      )}
                      aria-label="Toggle critere eliminatoire"
                    >
                      <span
                        className={cn(
                          "absolute start-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                          getSwitchThumbClass(criterion.eliminatory),
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditCriterionForm(criterion)}
                        className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                        aria-label="Modifier le critere"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCriterion(criterion.id)}
                        className="rounded p-1 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label="Supprimer le critere"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showCriterionForm && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            {editingCriterionId
              ? "Modifier le critere"
              : "Nouveau critere d&apos;eligibilite"}
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                Designation
              </label>
              <input
                value={criterionForm.designation}
                onChange={(event) =>
                  updateCriterionField("designation", event.target.value)
                }
                placeholder="Ex. Capacite financiere"
                className={cn(
                  "h-9 w-full rounded-md border px-3 text-xs outline-none focus:border-[#4CAF50]",
                  criterionErrors.designation
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 bg-white",
                )}
              />
              {criterionErrors.designation && (
                <p className="mt-1 text-[11px] text-red-600">
                  {criterionErrors.designation}
                </p>
              )}
            </div>
            <div>
              <div className="flex h-full items-end">
                <div className="w-full rounded-md border border-slate-200 bg-white px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">
                      Eliminatoire
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateCriterionField(
                          "eliminatory",
                          !criterionForm.eliminatory,
                        )
                      }
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        criterionForm.eliminatory
                          ? "bg-[#4CAF50]"
                          : "bg-slate-300",
                      )}
                      aria-label="Toggle eliminatoire"
                    >
                      <span
                        className={cn(
                          "absolute start-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                          getSwitchThumbClass(criterionForm.eliminatory),
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                Description
              </label>
              <textarea
                rows={3}
                value={criterionForm.description}
                onChange={(event) =>
                  updateCriterionField("description", event.target.value)
                }
                placeholder="Decrire le critere et les exigences attendues..."
                className={cn(
                  "w-full rounded-md border px-3 py-2 text-xs outline-none focus:border-[#4CAF50]",
                  criterionErrors.description
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 bg-white",
                )}
              />
              {criterionErrors.description && (
                <p className="mt-1 text-[11px] text-red-600">
                  {criterionErrors.description}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={cancelCriterionEdit}
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={saveCriterion}
              className="inline-flex h-9 items-center justify-center rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95"
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}
      {criteria.length === 0 && (
        <p className="mt-2 text-[11px] font-medium text-red-600">
          Ajoutez au moins un critere pour passer a l&apos;etape suivante.
        </p>
      )}
      <div className="mt-4 flex flex-col-reverse gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          {dict.buttons.back}
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
    </section>
  );
}
