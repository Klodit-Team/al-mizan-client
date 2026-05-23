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
  getServiceContractantTenderById,
  updateServiceContractantTenderStatus,
  type ServiceContractantApiStatus,
  type ServiceContractantTenderDetail,
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
  dict: any;
  aoId: string;
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

function getStageLabel(stage: WorkflowStage, dict: any): string {
  const labelFromSteps = WORKFLOW_STEPS.find((item) => item.key === stage)?.label || stage;
  // Try to find a localized label in dict.tendersList.statusLabels or dict.aoCreation.steps
  const localized = dict.tendersList?.statusLabels?.[stage];
  return localized || labelFromSteps;
}

function getTypeLabel(type: ServiceContractantTenderType, dict: any) {
  if (type === "ouvert") return dict.tendersList?.typeLabels?.ouvert || "Appel d'offres ouvert";
  if (type === "restreint") return dict.tendersList?.typeLabels?.restreint || "Appel d'offres restreint";
  return dict.tendersList?.typeLabels?.gre_a_gre || "Procédure gré à gré";
}

function mapTenderStatusToWorkflowStage(
  status: ServiceContractantTenderDetail["status"] | undefined,
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

function nextApiStatusForStage(stage: WorkflowStage): ServiceContractantApiStatus | null {
  if (stage === "brouillon") return "PUBLIE";
  if (stage === "publie") return "EN_COURS";
  if (stage === "en_cours") return "OUVERTURE_PLIS";
  if (stage === "ouverture_plis") return "EVALUATION";
  if (stage === "evaluation") return "ATTRIBUE";

  return null;
}

function mapApiStatusToWorkflowStage(status: ServiceContractantApiStatus): WorkflowStage {
  if (status === "PUBLIE") return "publie";
  if (status === "EN_COURS") return "en_cours";
  if (status === "OUVERTURE_PLIS") return "ouverture_plis";
  if (status === "EVALUATION") return "evaluation";
  if (status === "ATTRIBUE" || status === "CLOTURE") return "attribue";

  return "brouillon";
}

export default function AoDetailPage({
  locale,
  dict,
  aoId,
  initialTab = "soumissions",
}: AoDetailPageProps) {
  const isRtl = locale === "ar";
  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);
  const [tender, setTender] = useState<ServiceContractantTenderDetail | null>(
    null,
  );
  const [loadingTender, setLoadingTender] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isApplyingStatus, setIsApplyingStatus] = useState(false);
  const [stage, setStage] = useState<WorkflowStage>(
    "brouillon",
  );
  const [soumissionsCount, setSoumissionsCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    const loadTender = async () => {
      setLoadingTender(true);
      setLoadingError(null);

      try {
        const data = await getServiceContractantTenderById(aoId);
        if (!isMounted) {
          return;
        }

        if (!data) {
          setTender(null);
          setLoadingError("Appel d'offres introuvable ou non autorise.");
          return;
        }

        setTender(data);
        setStage(mapTenderStatusToWorkflowStage(data.status));
      } catch {
        if (isMounted) {
          setTender(null);
          setLoadingError("Impossible de charger cet appel d'offres.");
        }
      } finally {
        if (isMounted) {
          setLoadingTender(false);
        }
      }
    };

    void loadTender();

    return () => {
      isMounted = false;
    };
  }, [aoId]);

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
    { key: "general", label: dict.appelsOffres?.detail?.tabs?.general || "Infos Générales" },
    { key: "lots", label: dict.appelsOffres?.detail?.tabs?.lots || "Lots" },
    { key: "cdc", label: dict.appelsOffres?.detail?.tabs?.documents || "CDC" },
    { key: "criteria", label: dict.aoCreation?.steps?.step5?.scoringTitle || "Critères" },
    { key: "soumissions", label: dict.soumissions?.mesSoumissions?.title || "Soumissions", count: soumissionsCount },
    { key: "evaluation", label: dict.tendersList?.statusLabels?.evaluation || "Evaluation" },
    { key: "attribution", label: dict.aoCreation?.steps?.step6?.stepTitle || "Attribution" },
    { key: "recours", label: dict.recoursClaims?.list?.title || "Recours" },
    { key: "avis", label: dict.aoCreation?.steps?.step6?.avisGenerated || "Avis" },
  ];

  const currentStepIndex = useMemo(
    () => WORKFLOW_STEPS.findIndex((item) => item.key === stage),
    [stage],
  );

  const lots = tender?.lots || [];
  const eligibilityCriteria = tender?.eligibilityCriteria || [];
  const evaluationMatrix = tender?.evaluationCriteria || [];

  const applyStatus = async (status: ServiceContractantApiStatus) => {
    setIsApplyingStatus(true);
    setActionError(null);

    try {
      await updateServiceContractantTenderStatus(aoId, status);
      setStage(mapApiStatusToWorkflowStage(status));
    } catch {
      setActionError("Impossible de mettre a jour le statut de cet appel d'offres.");
    } finally {
      setIsApplyingStatus(false);
    }
  };

  const nextStage = () => {
    const nextStatus = nextApiStatusForStage(stage);
    if (!nextStatus) {
      return;
    }

    void applyStatus(nextStatus);
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

  const publishDate = tender
    ? formatDate(tender.publicationDate || tender.deadline, locale)
    : "-";
  const closeDate = tender ? formatDate(tender.deadline, locale) : "-";
  const lastCdc = tender?.cdcDocuments?.[0] || null;

  if (loadingTender) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Chargement des details de l'appel d'offres...
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        {loadingError}
      </div>
    );
  }

  const effectiveActiveTab = isTabEnabledForStage(activeTab, stage)
    ? activeTab
    : "general";
  const activeTabLabel =
    tabs.find((item) => item.key === effectiveActiveTab)?.label || (dict.appelsOffres?.detail?.title || "Details");
  const canPublish = stage === "brouillon";

  const renderActiveTabContent = () => {
    if (!isTabEnabledForStage(effectiveActiveTab, stage)) {
      const requiredStage = TAB_STAGE_REQUIREMENTS[activeTab];
      return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
          Cet onglet sera disponible à partir de l'étape{" "}
          <span className="font-semibold text-slate-800">
            {requiredStage ? getStageLabel(requiredStage, dict) : "suivante"}
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
              Procédure
            </p>
            <p className="mt-1 text-slate-700">
              {tender ? getTypeLabel(tender.type, dict) : "-"}
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
              {lots.length === 0 ? (
                <tr className="text-xs text-slate-500">
                  <td colSpan={5} className="px-2 py-6 text-center">
                    Aucun lot defini pour cet appel d'offres.
                  </td>
                </tr>
              ) : (
                lots.map((lot) => (
                <tr
                  key={lot.id}
                  className="border-b border-slate-100 text-xs text-slate-700"
                >
                  <td className="px-2 py-3 font-semibold text-[#2F9E44]">
                    {lot.number}
                  </td>
                  <td className="px-2 py-3">{lot.designation}</td>
                  <td className="px-2 py-3 text-slate-600">
                    -
                  </td>
                  <td className="px-2 py-3">{lot.amount}</td>
                  <td className="px-2 py-3">-</td>
                </tr>
                ))
              )}
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
              {lastCdc ? `CDC-${lastCdc.documentId}.pdf` : "Aucun CDC"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {lastCdc?.publishedAt
                ? `Publie le ${formatDate(lastCdc.publishedAt, locale)}`
                : "Aucune publication enregistree"}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={!lastCdc}
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
            <p className="mt-2 text-slate-700">
              Prix retrait: {lastCdc?.withdrawalPrice || "0 DZD"}
            </p>
            <p className="mt-1 text-slate-700">
              Derniere mise a jour: {lastCdc?.publishedAt ? formatDate(lastCdc.publishedAt, locale) : "-"}
            </p>
            <p className="mt-1 text-slate-700">
              Statut publication: {lastCdc ? "Publie" : "Non publie"}
            </p>
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
              {eligibilityCriteria.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Aucun critere d'eligibilite defini.
                </p>
              ) : (
                eligibilityCriteria.map((criterion) => (
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
                ))
              )}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="mb-2 text-sm font-semibold text-slate-800">
              Ponderation evaluation
            </p>
            <div className="space-y-2">
              {evaluationMatrix.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Aucun critere d'evaluation defini.
                </p>
              ) : (
                evaluationMatrix.map((item) => (
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
                ))
              )}
            </div>
            <div className="mt-3 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              Total ponderation: {Math.round(evaluationMatrix.reduce((sum, item) => sum + item.weight, 0) * 100) / 100}%
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
      return <RecoursListTab locale={locale} dict={dict.recoursClaims?.list} aoId={aoId} isRtl={isRtl} />;
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
          {dict.aoCreation?.header?.breadcrumbDashboard || "Tableau de bord"} <span className="mx-1">/</span> {dict.tendersList?.title || "Mes marchés"}{" "}
          <span className="mx-1">/</span> {dict.appelsOffres?.detail?.title || "Détails AO"}
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
                {dict.tendersList?.actions?.edit || "Modifier"}
              </Link>
            )}

            <button
              type="button"
              disabled={isApplyingStatus || !canPublish}
              onClick={() => {
                if (canPublish) {
                  void applyStatus("PUBLIE");
                }
              }}
              className="inline-flex h-8 items-center gap-1 rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="h-3 w-3" />
              {isApplyingStatus
                ? (dict.aoCreation?.steps?.step6?.submitting || "Mise à jour...")
                : canPublish
                  ? (dict.aoCreation?.steps?.step6?.publishBtn || "Publier AO")
                  : (dict.aoCreation?.steps?.step6?.alreadyPublished || "AO déjà publié")}
            </button>
          </div>
        </div>

        {actionError && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {actionError}
          </div>
        )}
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="space-y-2 rounded-lg bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {dict.tendersList?.table?.reference || "Référence"}
            </p>
            <p className="text-sm font-bold text-slate-900">
              {tender?.reference || aoId}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {dict.tendersList?.table?.object || "Objet"}
            </p>
            <p className="text-xs text-slate-600">
              {tender?.object || "Aucun objet"}
            </p>
          </div>

          <div className="space-y-2 rounded-lg bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {dict.tendersList?.statusLabels?.title || "Statut actuel"}
            </p>
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                statusBadgeClass,
              )}
            >
              {getStageLabel(stage, dict)}
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Type procédure
            </p>
            <p className="text-xs text-slate-600">
              {tender ? getTypeLabel(tender.type, dict) : "-"}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {dict.tendersList?.card?.estimatedAmount || "Montant estimé"}
            </p>
            <p className="text-xs text-slate-600">{tender?.amount || "-"}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {dict.tendersList?.labels?.wilaya || "Wilaya / Secteur"}
            </p>
            <p className="text-xs text-slate-600">
              {tender ? `${tender.wilaya} / ${tender.sector}` : "-"}
            </p>
          </div>

          <div className="space-y-2 rounded-lg bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-[#4CAF50]" />
              {dict.tendersList?.card?.submitted || "Publié le:"} <span className="font-semibold">{publishDate}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-[#4CAF50]" />
              {dict.tendersList?.card?.deadline || "Clôture le:"}{" "}
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
                  {getStageLabel(item.key, dict)}
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
              {dict.appelsOffres?.detail?.gestionAo || "Gestion AO"}
            </p>

            <div className="space-y-2">
              <button
                type="button"
                disabled={isApplyingStatus}
                onClick={() => void applyStatus("OUVERTURE_PLIS")}
                className="flex w-full items-center justify-between rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                {dict.appelsOffres?.detail?.buttons?.manageCommission || "Gérer Commission"}
                <Settings className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                disabled={isApplyingStatus}
                onClick={nextStage}
                className="flex w-full items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {dict.appelsOffres?.detail?.buttons?.changeStatus || "Changer de statut"}
                <Check className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                disabled={isApplyingStatus || stage !== "evaluation"}
                onClick={() => void applyStatus("ATTRIBUE")}
                className="flex w-full items-center justify-between rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {dict.appelsOffres?.detail?.buttons?.pronounceAttribution || "Prononcer Attribution"}
                <Gavel className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                disabled={isApplyingStatus}
                onClick={() => void applyStatus("ANNULE")}
                className="flex w-full items-center justify-between rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                {dict.appelsOffres?.detail?.buttons?.cancelTender || "Annuler Marché"}
                <AlertTriangle className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-[#D8EFD9] bg-[#EFF9EF] p-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2F9E44]">
              {dict.appelsOffres?.detail?.help?.title || "Aide et support"}
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              {dict.appelsOffres?.detail?.help?.description || "Consultez le manuel de l'acteur public pour la phase d'ouverture des plis et d'évaluation technique."}
            </p>
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2F9E44] hover:underline"
            >
              {dict.appelsOffres?.detail?.help?.documentation || "Documentation"} <UserCheck className="h-3 w-3" />
            </button>
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2F9E44] hover:underline"
            >
              {dict.appelsOffres?.detail?.help?.integrity || "Intégrité commission"} <ShieldCheck className="h-3 w-3" />
            </button>
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2F9E44] hover:underline"
            >
              {dict.appelsOffres?.detail?.help?.members || "Membres commission"} <Users className="h-3 w-3" />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
