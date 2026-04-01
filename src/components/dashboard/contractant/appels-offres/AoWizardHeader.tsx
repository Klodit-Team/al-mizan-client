import { memo } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface AoWizardHeaderProps {
  step: number;
  stepPrefix: string;
  stepOn: string;
  stepTitles: readonly string[];
  pageTitle: string;
  isEditMode: boolean;
  progressPercent: number;
}

function AoWizardHeaderComponent({
  step,
  stepPrefix,
  stepOn,
  stepTitles,
  pageTitle,
  isEditMode,
  progressPercent,
}: AoWizardHeaderProps) {
  const currentStepTitle = stepTitles[step - 1] || "";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] text-slate-500">
        Tableau de bord <span className="mx-1">/</span> Appels d&apos;offres{" "}
        <span className="mx-1">/</span> {stepPrefix} {step}: {currentStepTitle}
      </p>

      <div className="mt-1 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{pageTitle}</h1>
          {isEditMode && (
            <p className="mt-1 text-xs font-medium text-slate-500">
              Edition du brouillon AO en cours.
            </p>
          )}
          <p className="mt-1 text-sm font-medium text-[#4CAF50]">
            {stepPrefix} {step} {stepOn} 6 : {currentStepTitle}
          </p>
        </div>

        <div className="w-full max-w-90">
          <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Progression</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#4CAF50] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2 grid grid-cols-6 gap-1.5">
            {stepTitles.map((_, index) => {
              const idx = index + 1;
              const active = idx === step;
              const done = idx < step;

              return (
                <div
                  key={idx}
                  className={cn(
                    "flex h-6 items-center justify-center rounded-md border text-[10px] font-semibold",
                    done
                      ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                      : active
                        ? "border-[#4CAF50] bg-[#4CAF50] text-white"
                        : "border-slate-200 bg-slate-100 text-slate-500",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : idx}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const AoWizardHeader = memo(AoWizardHeaderComponent);

export default AoWizardHeader;
