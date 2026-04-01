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
export default function Step5({ props }: { props: WizardStepProps }) {
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
    openCreateEvaluationForm,
    openEditEvaluationForm,
    updateEvaluationField,
    cancelEvaluationEdit,
    technicalCriteriaCount,
    financialCriteriaCount,
    activeEvaluationCriteria,
    totalEvaluationWeight,
    activeEvaluationWeight,
  } = props;

  const roundedTotalWeight = Math.round(totalEvaluationWeight * 100) / 100;
  const roundedActiveWeight = Math.round(activeEvaluationWeight * 100) / 100;
  const remainingWeight = Math.round((100 - totalEvaluationWeight) * 100) / 100;
  const isWeightBalanced = Math.abs(totalEvaluationWeight - 100) <= 0.01;
  const isWeightOverflow = totalEvaluationWeight > 100.01;

  const meterClass = isWeightBalanced
    ? "bg-[#4CAF50]"
    : isWeightOverflow
      ? "bg-red-500"
      : "bg-amber-500";
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-3">
        <h2 className="text-2xl font-bold text-slate-900">
          {dict.stepPrefix} 5: {stepTitles[4]}
        </h2>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
        <div className="border-b border-slate-200">
          <div className="grid grid-cols-2">
            <button
              type="button"
              onClick={() => setEvaluationTab("technique")}
              className={cn(
                "h-10 border-b-2 text-xs font-semibold transition-colors",
                evaluationTab === "technique"
                  ? "border-[#4CAF50] text-[#2F9E44]"
                  : "border-transparent text-slate-500 hover:text-slate-700",
              )}
            >
              Criteres techniques
            </button>
            <button
              type="button"
              onClick={() => setEvaluationTab("financier")}
              className={cn(
                "h-10 border-b-2 text-xs font-semibold transition-colors",
                evaluationTab === "financier"
                  ? "border-[#4CAF50] text-[#2F9E44]"
                  : "border-transparent text-slate-500 hover:text-slate-700",
              )}
            >
              Criteres financiers
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Liste des criteres
            </h2>
            <button
              type="button"
              onClick={openCreateEvaluationForm}
              className="inline-flex h-8 items-center justify-center gap-1 rounded-md text-xs font-semibold text-[#2F9E44] hover:bg-emerald-50 px-2.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter critere
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-2">Order</th>
                  <th className="px-2 py-2">Designation</th>
                  <th className="px-2 py-2">Type</th>
                  <th className="px-2 py-2">Lot</th>
                  <th className="px-2 py-2">Ponderation (%)</th>
                  <th className="px-2 py-2">Note Elimin.</th>
                  <th className="px-2 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeEvaluationCriteria.length === 0 ? (
                  <tr className="text-xs text-slate-500">
                    <td colSpan={7} className="px-2 py-6 text-center">
                      Aucun critere {evaluationTab} pour le moment.
                    </td>
                  </tr>
                ) : (
                  activeEvaluationCriteria.map(
                    (criterion: any, index: number) => (
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
                                onClick={() =>
                                  moveEvaluationCriterionUp(criterion.id)
                                }
                                disabled={index === 0}
                                className="rounded p-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                                aria-label="Monter le critere"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  moveEvaluationCriterionDown(criterion.id)
                                }
                                disabled={
                                  index === activeEvaluationCriteria.length - 1
                                }
                                className="rounded p-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                                aria-label="Descendre le critere"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 font-semibold text-slate-800">
                          {criterion.designation}
                        </td>
                        <td className="px-2 py-3">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700">
                            {criterion.type}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-slate-500">
                          {criterion.lotAssignment || "-"}
                        </td>
                        <td className="px-2 py-3 font-semibold text-[#2F9E44]">
                          {criterion.weighting}%
                        </td>
                        <td className="px-2 py-3 text-slate-500">
                          {criterion.eliminationScore
                            ? `${criterion.eliminationScore}/100`
                            : "-"}
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditEvaluationForm(criterion)}
                              className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                              aria-label="Modifier le critere d'evaluation"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                deleteEvaluationCriterion(criterion.id)
                              }
                              className="rounded p-1 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                              aria-label="Supprimer le critere d'evaluation"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
          {showEvaluationForm && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">
                {editingEvaluationId
                  ? "Modifier le critere"
                  : "Nouveau critere d'evaluation"}
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                    Designation
                  </label>
                  <input
                    value={evaluationForm.designation}
                    onChange={(event) =>
                      updateEvaluationField("designation", event.target.value)
                    }
                    placeholder="Ex. Methodology & Work Plan"
                    className={cn(
                      "h-9 w-full rounded-md border px-3 text-xs outline-none focus:border-[#4CAF50]",
                      evaluationErrors.designation
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200 bg-white",
                    )}
                  />
                  {evaluationErrors.designation && (
                    <p className="mt-1 text-[11px] text-red-600">
                      {evaluationErrors.designation}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                    Type
                  </label>
                  <select
                    value={evaluationForm.type}
                    onChange={(event) =>
                      updateEvaluationField("type", event.target.value as any)
                    }
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs outline-none focus:border-[#4CAF50]"
                  >
                    <option value="technique">Technique</option>
                    <option value="financier">Financier</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                    Ponderation (%)
                  </label>
                  <input
                    value={evaluationForm.weighting}
                    onChange={(event) =>
                      updateEvaluationField("weighting", event.target.value)
                    }
                    placeholder="0 - 100"
                    className={cn(
                      "h-9 w-full rounded-md border px-3 text-xs outline-none focus:border-[#4CAF50]",
                      evaluationErrors.weighting
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200 bg-white",
                    )}
                  />
                  {evaluationErrors.weighting && (
                    <p className="mt-1 text-[11px] text-red-600">
                      {evaluationErrors.weighting}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                    Note eliminatoire (/100)
                  </label>
                  <input
                    value={evaluationForm.eliminationScore}
                    onChange={(event) =>
                      updateEvaluationField(
                        "eliminationScore",
                        event.target.value,
                      )
                    }
                    placeholder="Optionnel"
                    className={cn(
                      "h-9 w-full rounded-md border px-3 text-xs outline-none focus:border-[#4CAF50]",
                      evaluationErrors.eliminationScore
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200 bg-white",
                    )}
                  />
                  {evaluationErrors.eliminationScore && (
                    <p className="mt-1 text-[11px] text-red-600">
                      {evaluationErrors.eliminationScore}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                    Lot (si applicable)
                  </label>
                  <input
                    value={evaluationForm.lotAssignment}
                    onChange={(event) =>
                      updateEvaluationField("lotAssignment", event.target.value)
                    }
                    placeholder="Ex. Lot 01, All Lots"
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs outline-none focus:border-[#4CAF50]"
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelEvaluationEdit}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={saveEvaluationCriterion}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-slate-800">
              {roundedTotalWeight}%
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              Ponderation totale
            </p>
            <p className="mt-1 text-xs text-slate-500">
              La somme des ponderations doit etre egale a 100%
            </p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-200">
            <div
              className={cn("h-full rounded-full transition-all", meterClass)}
              style={{ width: `${Math.min(100, totalEvaluationWeight)}%` }}
            />
          </div>
          <p
            className={cn(
              "mt-2 text-center text-[11px] font-semibold",
              isWeightBalanced
                ? "text-[#2F9E44]"
                : isWeightOverflow
                  ? "text-red-600"
                  : "text-amber-600",
            )}
          >
            {isWeightBalanced
              ? "VALIDATED"
              : isWeightOverflow
                ? `DEPASSEMENT: +${Math.abs(remainingWeight)}%`
                : `RESTANT: ${Math.abs(remainingWeight)}%`}
          </p>

          <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
            <div className="flex items-center justify-between">
              <span>Poids de l&apos;onglet actif ({evaluationTab})</span>
              <span className="font-semibold text-slate-800">
                {roundedActiveWeight}%
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#D8EFD9] bg-[#EFF9EF] p-3">
          <p className="text-xs font-semibold text-[#2F9E44]">Exigence</p>
          <p className="mt-1 text-[11px] text-slate-600">
            Assurez-vous que chaque critere a un ordre unique et un lot coherent
            avant la revue finale.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold text-slate-800">
            Statistiques rapides
          </p>
          <div className="mt-2 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span>Groupes techniques</span>
              <span className="font-semibold text-slate-800">
                {technicalCriteriaCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Groupes financiers</span>
              <span className="font-semibold text-slate-800">
                {financialCriteriaCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Lots assignes</span>
              <span className="font-semibold text-slate-800">
                {
                  evaluationCriteria.filter(
                    (item: any) => item.lotAssignment.trim().length > 0,
                  ).length
                }
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-3">
        {evaluationStepError && (
          <p className="mb-2 text-[11px] font-medium text-red-600">
            {evaluationStepError}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
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
      </div>
    </section>
  );
}
