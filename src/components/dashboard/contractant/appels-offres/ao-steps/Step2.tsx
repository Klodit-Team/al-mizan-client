import { WizardStepProps } from "./types";
import React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
export default function Step2({ props }: { props: WizardStepProps }) {
  const {
    dict,
    stepTitles,
    
    lots,
   
    lotForm,
   
    showLotForm,
   
    editingLotId,
   
    saveLot,
 
    deleteLot,
    lotErrors,
    
    goBack,
    goNextAfterValidation,
   
    openCreateLotForm,
    openEditLotForm,
    updateLotField,
    cancelLotEdit,
  } = props;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-2xl font-bold text-slate-900">
          {dict.stepPrefix} 2: {stepTitles[1]}
        </h2>
      </div>
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {dict.step2.title}
          </h3>
          <p className="text-xs text-slate-500">
            {dict.step2.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateLotForm}
          className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95"
        >
          <Plus className="h-3.5 w-3.5" />
          {dict.step2.addLotBtn}
        </button>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[11px] font-semibold text-slate-500">
              <th className="px-2 py-2">{dict.step2.columns.number}</th>
              <th className="px-2 py-2">{dict.step2.columns.designation}</th>
              <th className="px-2 py-2">{dict.step2.columns.description}</th>
              <th className="px-2 py-2">{dict.step2.columns.estimatedAmount}</th>
              <th className="px-2 py-2">{dict.step2.columns.delay}</th>
              <th className="px-2 py-2 text-right">{dict.step2.columns.actions}</th>
            </tr>
          </thead>
          <tbody>
            {lots.length === 0 ? (
              <tr className="text-xs text-slate-500">
                <td colSpan={6} className="px-2 py-6 text-center">
                  {dict.step2.emptyMessage}
                </td>
              </tr>
            ) : (
              lots.map((lot: any) => (
                <tr
                  key={lot.id}
                  className="border-b border-slate-100 text-xs text-slate-700"
                >
                  <td className="px-2 py-3 font-medium">{lot.lotNumber}</td>
                  <td className="px-2 py-3 font-semibold text-[#2F9E44]">
                    {lot.designation}
                  </td>
                  <td className="max-w-[220px] px-2 py-3 text-slate-500">
                    <span className="line-clamp-1">{lot.description}</span>
                  </td>
                  <td className="px-2 py-3">
                    <span className="font-medium">{lot.estimatedAmount}</span>
                    <span className="ml-1 text-slate-500">{dict.currency}</span>
                  </td>
                  <td className="px-2 py-3">{lot.delayDays} {dict.step2.daysUnit}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditLotForm(lot)}
                        className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                        aria-label="Modifier le lot"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteLot(lot.id)}
                        className="rounded p-1 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label="Supprimer le lot"
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
      {showLotForm && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            {editingLotId ? dict.step2.editLotTitle : dict.step2.newLotTitle}
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                {dict.step2.lotNumberLabel}
              </label>
              <input
                value={lotForm.lotNumber}
                readOnly
                disabled
                className={cn(
                  "h-9 w-full rounded-md border border-slate-200 bg-slate-100 px-3 text-xs text-slate-600 outline-none",
                )}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                {dict.step2.designationLabel}
              </label>
              <input
                value={lotForm.designation}
                onChange={(event) =>
                  updateLotField("designation", event.target.value)
                }
                placeholder={dict.step2.designationPlaceholder}
                className={cn(
                  "h-9 w-full rounded-md border px-3 text-xs outline-none focus:border-[#4CAF50]",
                  lotErrors.designation
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 bg-white",
                )}
              />
              {lotErrors.designation && (
                <p className="mt-1 text-[11px] text-red-600">
                  {lotErrors.designation}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                {dict.step2.delayLabel}
              </label>
              <input
                value={lotForm.delayDays}
                onChange={(event) =>
                  updateLotField("delayDays", event.target.value)
                }
                placeholder={dict.step2.delayPlaceholder}
                className={cn(
                  "h-9 w-full rounded-md border px-3 text-xs outline-none focus:border-[#4CAF50]",
                  lotErrors.delayDays
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 bg-white",
                )}
              />
              {lotErrors.delayDays && (
                <p className="mt-1 text-[11px] text-red-600">
                  {lotErrors.delayDays}
                </p>
              )}
            </div>
            <div className="md:col-span-3">
              <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                {dict.step2.descriptionLabel}
              </label>
              <input
                value={lotForm.description}
                onChange={(event) =>
                  updateLotField("description", event.target.value)
                }
                placeholder={dict.step2.descriptionPlaceholder}
                className={cn(
                  "h-9 w-full rounded-md border px-3 text-xs outline-none focus:border-[#4CAF50]",
                  lotErrors.description
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 bg-white",
                )}
              />
              {lotErrors.description && (
                <p className="mt-1 text-[11px] text-red-600">
                  {lotErrors.description}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                {dict.step2.estimatedAmountLabel}
              </label>
              <input
                value={lotForm.estimatedAmount}
                onChange={(event) =>
                  updateLotField("estimatedAmount", event.target.value)
                }
                placeholder="0.00"
                className={cn(
                  "h-9 w-full rounded-md border px-3 text-xs outline-none focus:border-[#4CAF50]",
                  lotErrors.estimatedAmount
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 bg-white",
                )}
              />
              {lotErrors.estimatedAmount && (
                <p className="mt-1 text-[11px] text-red-600">
                  {lotErrors.estimatedAmount}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={cancelLotEdit}
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              {dict.buttons.cancel}
            </button>
            <button
              type="button"
              onClick={saveLot}
              className="inline-flex h-9 items-center justify-center rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95"
            >
              {dict.step2.saveLotBtn}
            </button>
          </div>
        </div>
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
