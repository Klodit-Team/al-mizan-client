"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  Check,
  Download,
  Filter,
  Megaphone,
  Gavel,
  Pencil,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  type ServiceContractantTenderItem,
  type ServiceContractantTenderType,
} from "@/services/tenders";
import { listServiceContractantTenderSubmissions } from "@/services/tenderSubmissions";
import AttributionTab from "./attribution/AttributionTab";
import AvisListTab from "./avis/AvisListTab";
import EvaluationOverviewTab from "./evaluation/EvaluationOverviewTab";
import RecoursListTab from "./recours/RecoursListTab";
import SoumissionsListTab from "./soumissions/SoumissionsListTab";

type WorkflowStage =
  | "brouillon"
  | "publie"
  | "en_cours"
  | "ouverture_plis"
  | "evaluation"
  | "attribue";

type DetailTab =
  | "general"
  | "lots"
  | "cdc"
  | "criteria"
  | "soumissions"
  | "evaluation"
  | "attribution"
  | "recours"
  | "avis";

interface AoDetailPageProps {
  locale: string;
  aoId: string;
  tender: ServiceContractantTenderItem | null;
  initialTab?: DetailTab;
}

const WORKFLOW_STEPS: Array<{ key: WorkflowStage; label: string }> = [
  { key: "brouillon", label: "Brouillon" },
  { key: "publie", label: "Publie" },
  { key: "en_cours", label: "En cours" },
  { key: "ouverture_plis", label: "Ouverture plis" },
  { key: "evaluation", label: "Evaluation" },
  { key: "attribue", label: "Attribue" },
];

const TAB_STAGE_REQUIREMENTS: Partial<Record<DetailTab, WorkflowStage>> = {
  soumissions: "en_cours",
  evaluation: "evaluation",
  attribution: "evaluation",
  recours: "attribue",
  avis: "publie",
};

function getStageIndex(stage: WorkflowStage): number {
  return WORKFLOW_STEPS.findIndex((item) => item.key === stage);
}

function isTabEnabledForStage(tab: DetailTab, stage: WorkflowStage): boolean {
  const requiredStage = TAB_STAGE_REQUIREMENTS[tab];
  if (!requiredStage) {
    return true;
  }

  return getStageIndex(stage) >= getStageIndex(requiredStage);
}

function getStageLabel(stage: WorkflowStage): string {
  return WORKFLOW_STEPS.find((item) => item.key === stage)?.label || stage;
}

function getTypeLabel(type: ServiceContractantTenderType) {
  if (type === "ouvert") return "Appel offres ouvert";
  if (type === "restreint") return "Appel offres restreint";
  return "Procedure gre a gre";
}

function mapTenderStatusToWorkflowStage(
  status: ServiceContractantTenderItem["status"] | undefined,
): WorkflowStage {
  switch (status) {
    case "brouillon":
      return "brouillon";
    case "publie":
      return "publie";
    case "en_cours":
      return "en_cours";
    case "evaluation":
      return "evaluation";
    case "attribue":
      return "attribue";
    default:
      return "brouillon";
  }
}

function formatDate(dateValue: string, locale: string) {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : "fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

export default function AoDetailPage({
  locale,
  aoId,
  tender,
  initialTab = "soumissions",
}: AoDetailPageProps) {
  const isRtl = locale === "ar";
  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);
  const [stage, setStage] = useState<WorkflowStage>(
    mapTenderStatusToWorkflowStage(tender?.status),
  );
  const [soumissionsCount, setSoumissionsCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    const loadSoumissionsCount = async () => {
      try {
        const rows = await listServiceContractantTenderSubmissions(aoId);
        if (isMounted) {
          setSoumissionsCount(rows.length);
        }
      } catch {
        if (isMounted) {
          setSoumissionsCount(0);
        }
      }
    };

    void loadSoumissionsCount();

    return () => {
      isMounted = false;
    };
  }, [aoId]);

  const tabs: Array<{ key: DetailTab; label: string; count?: number }> = [
    { key: "general", label: "Infos Generales" },
    { key: "lots", label: "Lots" },
    { key: "cdc", label: "CDC" },
    { key: "criteria", label: "Criteres" },
    { key: "soumissions", label: "Soumissions", count: soumissionsCount },
    { key: "evaluation", label: "Evaluation" },
    { key: "attribution", label: "Attribution" },
    { key: "recours", label: "Recours" },
    { key: "avis", label: "Avis" },
  ];

  const currentStepIndex = useMemo(
    () => WORKFLOW_STEPS.findIndex((item) => item.key === stage),
    [stage],
  );

  const lots = [
    {
      id: "LOT-01",
      designation: "Serveurs de calcul",
      description: "Fourniture de 12 serveurs rack haute disponibilite",
      estimatedAmount: "28 000 000 DZD",
      delay: "45 jours",
    },
    {
      id: "LOT-02",
      designation: "Baies de stockage",
      description: "Acquisition de 4 baies SAN et maintenance 24 mois",
      estimatedAmount: "15 000 000 DZD",
      delay: "30 jours",
    },
  ];

  const eligibilityCriteria = [
    {
      id: "C1",
      label: "Capacite financiere",
      details: "CA annuel >= 1M DZD sur 3 ans",
      eliminatory: true,
    },
    {
      id: "C2",
      label: "Experience similaire",
      details: "Au moins 3 references equivalentes",
      eliminatory: true,
    },
    {
      id: "C3",
      label: "Certification qualite",
      details: "ISO 9001 en cours de validite",
      eliminatory: false,
    },
  ];

  const evaluationMatrix = [
    { id: "E1", label: "Offre technique", weight: 60 },
    { id: "E2", label: "Offre financiere", weight: 40 },
  ];

  const nextStage = () => {
    setStage((current) => {
      const idx = WORKFLOW_STEPS.findIndex((item) => item.key === current);
      if (idx < 0 || idx === WORKFLOW_STEPS.length - 1) {
        return current;
      }

      return WORKFLOW_STEPS[idx + 1].key;
    });
  };

  const statusBadgeClass =
    stage === "brouillon"
      ? "bg-slate-100 text-slate-700"
      : stage === "publie"
        ? "bg-blue-100 text-blue-700"
        : stage === "en_cours" || stage === "ouverture_plis"
          ? "bg-emerald-100 text-emerald-700"
          : stage === "evaluation"
            ? "bg-amber-100 text-amber-700"
            : "bg-green-100 text-green-700";

  const publishDate = tender ? formatDate(tender.deadline, locale) : "-";
  const closeDate = tender ? formatDate(tender.deadline, locale) : "-";

  const effectiveActiveTab = isTabEnabledForStage(activeTab, stage)
    ? activeTab
    : "general";
  const activeTabLabel =
    tabs.find((item) => item.key === effectiveActiveTab)?.label || "Details";
  const canPublish = stage === "brouillon";

  const renderActiveTabContent = () => {
    if (!isTabEnabledForStage(effectiveActiveTab, stage)) {
      const requiredStage = TAB_STAGE_REQUIREMENTS[activeTab];
      return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
          Cet onglet sera disponible a partir de l etape{" "}
          <span className="font-semibold text-slate-800">
            {requiredStage ? getStageLabel(requiredStage) : "suivante"}
          </span>
          .
        </div>
      );
    }

    if (effectiveActiveTab === "soumissions") {
      return (
        <SoumissionsListTab
          locale={locale}
          aoId={aoId}
          isRtl={isRtl}
          canViewDetail={
            getStageIndex(stage) >= getStageIndex("ouverture_plis")
          }
        />
      );
    }

    if (effectiveActiveTab === "general") {
      return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Reference AO
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {tender?.reference || aoId}
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Objet
            </p>
            <p className="mt-1 text-slate-700">
              {tender?.object || "Aucun objet"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Procedure
            </p>
            <p className="mt-1 text-slate-700">
              {tender ? getTypeLabel(tender.type) : "-"}
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Dates
            </p>
            <p className="mt-1 text-slate-700">Publication: {publishDate}</p>
            <p className="mt-1 text-slate-700">Cloture: {closeDate}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs md:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Description
            </p>
            <p className="mt-1 text-slate-700">
              Fourniture et installation de materiel informatique pour garantir
              la haute disponibilite des services numeriques et la continuite d
              activite.
            </p>
          </div>
        </div>
      );
    }

    if (effectiveActiveTab === "lots") {
      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2">Lot</th>
                <th className="px-2 py-2">Designation</th>
                <th className="px-2 py-2">Description</th>
                <th className="px-2 py-2">Montant estime</th>
                <th className="px-2 py-2">Delai</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => (
                <tr
                  key={lot.id}
                  className="border-b border-slate-100 text-xs text-slate-700"
                >
                  <td className="px-2 py-3 font-semibold text-[#2F9E44]">
                    {lot.id}
                  </td>
                  <td className="px-2 py-3">{lot.designation}</td>
                  <td className="px-2 py-3 text-slate-600">
                    {lot.description}
                  </td>
                  <td className="px-2 py-3">{lot.estimatedAmount}</td>
                  <td className="px-2 py-3">{lot.delay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (effectiveActiveTab === "cdc") {
      return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Document principal
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              CDC-Infrastructure-v1.3.pdf
            </p>
            <p className="mt-1 text-xs text-slate-500">Version v1.3 - 4.2 MB</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-3 w-3" /> Telecharger
              </button>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1 rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-90"
              >
                <Megaphone className="h-3 w-3" /> Publier rectificatif
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Parametres CDC
            </p>
            <p className="mt-2 text-slate-700">Prix retrait: 0.00 DZD</p>
            <p className="mt-1 text-slate-700">
              Derniere mise a jour: 18/11/2023 11:05
            </p>
            <p className="mt-1 text-slate-700">Statut publication: Publie</p>
          </div>
        </div>
      );
    }

    if (effectiveActiveTab === "criteria") {
      return (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="mb-2 text-sm font-semibold text-slate-800">
              Criteres eligibilite
            </p>
            <div className="space-y-2">
              {eligibilityCriteria.map((criterion) => (
                <div
                  key={criterion.id}
                  className="rounded-md border border-slate-200 bg-slate-50 p-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800">
                      {criterion.label}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        criterion.eliminatory
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-200 text-slate-700",
                      )}
                    >
                      {criterion.eliminatory
                        ? "Eliminatoire"
                        : "Non eliminatoire"}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600">{criterion.details}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="mb-2 text-sm font-semibold text-slate-800">
              Ponderation evaluation
            </p>
            <div className="space-y-2">
              {evaluationMatrix.map((item) => (
                <div key={item.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="font-semibold text-[#2F9E44]">
                      {item.weight}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-[#4CAF50]"
                      style={{ width: `${item.weight}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              Total ponderation: 100%
            </div>
          </div>
        </div>
      );
    }

    if (effectiveActiveTab === "evaluation") {
      return (
        <EvaluationOverviewTab locale={locale} aoId={aoId} isRtl={isRtl} />
      );
    }

    if (effectiveActiveTab === "attribution") {
      return (
        <AttributionTab
          locale={locale}
          aoId={aoId}
          onDefinitiveConfirmed={() => setStage("attribue")}
        />
      );
    }

    if (effectiveActiveTab === "recours") {
      return <RecoursListTab locale={locale} aoId={aoId} isRtl={isRtl} />;
    }

    if (effectiveActiveTab === "avis") {
      return <AvisListTab locale={locale} aoId={aoId} isRtl={isRtl} />;
    }

    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Aucun contenu disponible.
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <header className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-[11px] text-slate-500">
          Tableau de bord <span className="mx-1">/</span> Mes marches{" "}
          <span className="mx-1">/</span> Details AO
        </p>

        <div className="mt-1 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {tender?.reference || aoId} - {tender?.object || "Appel offres"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {stage === "brouillon" && (
              <Link
                href={`/${locale}/dashboard/contractant/appels-offres/${aoId}/edit`}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="h-3 w-3" />
                Modifier
              </Link>
            )}

            <button
              type="button"
              disabled={!canPublish}
              onClick={() => {
                if (canPublish) {
                  setStage("publie");
                }
              }}
              className="inline-flex h-8 items-center gap-1 rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="h-3 w-3" />
              {canPublish ? "Publier AO" : "AO deja publie"}
            </button>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="space-y-2 rounded-lg bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Reference
            </p>
            <p className="text-sm font-bold text-slate-900">
              {tender?.reference || aoId}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Objet
            </p>
            <p className="text-xs text-slate-600">
              {tender?.object || "Aucun objet"}
            </p>
          </div>

          <div className="space-y-2 rounded-lg bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Statut actuel
            </p>
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                statusBadgeClass,
              )}
            >
              {stage}
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Type procedure
            </p>
            <p className="text-xs text-slate-600">
              {tender ? getTypeLabel(tender.type) : "-"}
            </p>
          </div>

          <div className="space-y-2 rounded-lg bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-[#4CAF50]" />
              Publie le: <span className="font-semibold">{publishDate}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-[#4CAF50]" />
              Cloture le:{" "}
              <span className="font-semibold text-red-600">{closeDate}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-6 gap-2">
          {WORKFLOW_STEPS.map((item, index) => {
            const done = index <= currentStepIndex;
            const active = index === currentStepIndex;

            return (
              <div key={item.key} className="text-center">
                <div
                  className={cn(
                    "mx-auto flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
                    done
                      ? "border-[#4CAF50] bg-[#4CAF50] text-white"
                      : "border-slate-300 bg-white text-slate-400",
                  )}
                >
                  {done ? <Check className="h-3 w-3" /> : ""}
                </div>
                <p
                  className={cn(
                    "mt-1 text-[10px] font-semibold uppercase tracking-wide",
                    active ? "text-[#2F9E44]" : "text-slate-400",
                  )}
                >
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
        <div className="xl:col-span-3 space-y-3">
          <section className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div
              className={cn(
                "flex flex-wrap items-center gap-1",
                isRtl && "justify-end",
              )}
            >
              {tabs.map((tab) => {
                const active = tab.key === effectiveActiveTab;
                const enabled = isTabEnabledForStage(tab.key, stage);
                return (
                  <button
                    key={tab.key}
                    type="button"
                    disabled={!enabled}
                    onClick={() => {
                      if (enabled) {
                        setActiveTab(tab.key);
                      }
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 border-b-2 px-2 py-1.5 text-[11px] font-semibold transition-colors",
                      active
                        ? "border-[#4CAF50] text-[#2F9E44]"
                        : "border-transparent text-slate-500 hover:text-slate-700",
                      !enabled &&
                        "cursor-not-allowed border-transparent text-slate-300 hover:text-slate-300",
                    )}
                  >
                    {tab.label}
                    {typeof tab.count === "number" && (
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                {activeTabLabel}
              </h2>
              {effectiveActiveTab === "soumissions" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    <Filter className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {renderActiveTabContent()}
          </section>
        </div>

        <aside className="space-y-3">
          <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="mb-2 text-sm font-semibold text-slate-800">
              Gestion AO
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setStage("ouverture_plis")}
                className="flex w-full items-center justify-between rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Gerer Commission
                <Settings className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={nextStage}
                className="flex w-full items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Changer de statut
                <Check className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                disabled={stage !== "evaluation"}
                onClick={() => setStage("attribue")}
                className="flex w-full items-center justify-between rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Prononcer Attribution
                <Gavel className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                Annuler Marche
                <AlertTriangle className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-[#D8EFD9] bg-[#EFF9EF] p-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2F9E44]">
              Aide et support
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Consultez le manuel de lacteur public pour la phase douverture des
              plis et devaluation technique.
            </p>
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2F9E44] hover:underline"
            >
              Documentation <UserCheck className="h-3 w-3" />
            </button>
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2F9E44] hover:underline"
            >
              Integrite commission <ShieldCheck className="h-3 w-3" />
            </button>
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2F9E44] hover:underline"
            >
              Membres commission <Users className="h-3 w-3" />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
