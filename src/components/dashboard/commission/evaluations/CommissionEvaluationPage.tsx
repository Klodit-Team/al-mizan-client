"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  useMembresEvaluationQuery,
  useMesCommissionsQuery,
} from "@/services/commission-dashboard/queries";
import {
  useCommissionAoAnomaliesQuery,
  useCommissionAoCriteriaQuery,
  useCommissionAoSubmissionsQuery,
  useCommissionEvaluationContextQuery,
  useCommissionEvaluationCriteriaQuery,
  useCommissionEvaluationNotesQuery,
  useCommissionEvaluationSubmissionsQuery,
  useCommissionEvaluationsOverviewQuery,
  useSaveCommissionScoresMutation,
} from "@/services/commission/queries";
import { commissionKeys } from "@/services/commission/keys";
import { useQueryClient } from "@tanstack/react-query";
import type {
  CommissionEvaluationCriterion,
  CommissionEvaluationNote,
  CommissionEvaluationSubmission,
} from "@/services/commission/api";
import { registerCommissionEvaluationSubmission } from "@/services/commission/api";

interface Props {
  locale: string;
  selectedCommissionId: string;
}

interface MembreEvaluation {
  id: string;
  nom: string;
  prenom: string;
  role: string;
}

type DraftScores = Record<string, Record<string, { note: string; justification: string }>>;

function clampScore(value: string, max: number): string {
  if (value.trim() === "") return "";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";
  return String(Math.min(max, Math.max(0, numeric)));
}

function formatDate(value?: string | null, locale = "fr") {
  if (!value) return "Non planifiee";
  return new Date(value).toLocaleDateString(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusTone(status?: string) {
  switch (status) {
    case "EN_COURS":
    case "ACTIVE":
    case "DEPOSEE":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "TERMINEE":
    case "VALIDEE":
      return "border-sky-200 bg-sky-50 text-sky-800";
    case "BROUILLON":
    case "PRETE":
      return "border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function sourceLabel(source?: "evaluation" | "ao", isAr = false) {
  if (source === "evaluation") return isAr ? "مرتبطة بالتقييم" : "Liee a l'evaluation";
  return isAr ? "من العروض المودعة" : "Depuis les soumissions AO";
}

function buildAiInsights({
  hasEvaluation,
  hasCriteria,
  canSaveNotes,
  currentSubmission,
  anomaliesCount,
  completion,
  score,
}: {
  hasEvaluation: boolean;
  hasCriteria: boolean;
  canSaveNotes: boolean;
  currentSubmission?: CommissionEvaluationSubmission;
  anomaliesCount: number;
  completion: number;
  score: number;
}) {
  const insights: { title: string; body: string; tone: "good" | "warn" | "info" }[] = [];

  if (!hasEvaluation) {
    insights.push({
      title: "Evaluation non initialisee",
      body: "La commission et les soumissions sont disponibles, mais le service evaluation n'a pas encore cree la session de notation.",
      tone: "warn",
    });
  }

  if (!hasCriteria) {
    insights.push({
      title: "Grille absente",
      body: "Aucun critere n'est renvoye par le backend. La notation reste verrouillee pour eviter des scores non auditables.",
      tone: "warn",
    });
  }

  if (currentSubmission) {
    insights.push({
      title: "Soumission active",
      body: `${currentSubmission.reference} est ${currentSubmission.status || "en attente"}. Source: ${sourceLabel(currentSubmission.source)}.`,
      tone: "info",
    });
  }

  if (anomaliesCount > 0) {
    insights.push({
      title: "Anomalies IA",
      body: `${anomaliesCount} signalement(s) IA sont associes aux offres de cet AO. Verifiez les details avant notation.`,
      tone: "warn",
    });
  } else {
    insights.push({
      title: "Controle IA",
      body: "Aucune anomalie IA n'est remontee pour cet AO dans le service soumission.",
      tone: "good",
    });
  }

  if (hasCriteria && canSaveNotes) {
    insights.push({
      title: "Progression de notation",
      body: `${completion}% de la grille est renseignee. Score pondere provisoire: ${Math.round(score)} / 100.`,
      tone: completion === 100 ? "good" : "info",
    });
  }

  return insights;
}

function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.5L19 9.5V19a2 2 0 0 1-2 2Z" />
        </svg>
      </div>
      <p className="text-base font-bold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{body}</p>
    </div>
  );
}

export default function CommissionEvaluationPage({
  locale,
  selectedCommissionId,
}: Props) {
  const isAr = locale === "ar";
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [draftScores, setDraftScores] = useState<DraftScores>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const { data: mesCommissions, isLoading: loadingCommissions } = useMesCommissionsQuery();
  const { data: evaluationOverview, isLoading: loadingOverview } =
    useCommissionEvaluationsOverviewQuery();

  const selectedCommission = useMemo(
    () =>
      mesCommissions?.commissionsEvaluation.find(
        (item) =>
          item.id === selectedCommissionId ||
          item.aoId === selectedCommissionId ||
          item.appelOffreId === selectedCommissionId,
      ) ?? null,
    [mesCommissions, selectedCommissionId],
  );

  const overviewEvaluation = useMemo(
    () =>
      evaluationOverview?.find(
        (item) =>
          item.id === selectedCommissionId ||
          item.commissionId === selectedCommissionId ||
          item.aoId === selectedCommissionId ||
          item.commissionId === selectedCommission?.id ||
          item.aoId === selectedCommission?.aoId ||
          item.aoId === selectedCommission?.appelOffreId,
      ) ?? null,
    [evaluationOverview, selectedCommission, selectedCommissionId],
  );

  const seance = useMemo(
    () =>
      mesCommissions?.seancesOuverture.find(
        (item) =>
          item.id === selectedCommission?.seanceId ||
          item.commissionId === selectedCommission?.id ||
          item.commissionId === overviewEvaluation?.commissionId ||
          item.appelOffreId === selectedCommissionId,
      ) ?? null,
    [
      mesCommissions,
      overviewEvaluation?.commissionId,
      selectedCommission?.id,
      selectedCommission?.seanceId,
      selectedCommissionId,
    ],
  );

  const resolvedCommissionId =
    selectedCommission?.id ?? overviewEvaluation?.commissionId ?? "";
  const resolvedAoId =
    seance?.appelOffreId ??
    selectedCommission?.appelOffreId ??
    selectedCommission?.aoId ??
    overviewEvaluation?.aoId ??
    "";

  const { data: resolvedEvaluation, isLoading: loadingResolvedEvaluation } =
    useCommissionEvaluationContextQuery({
      commissionId: overviewEvaluation ? undefined : resolvedCommissionId,
      aoId: overviewEvaluation ? undefined : resolvedAoId,
      evaluationId:
        overviewEvaluation || resolvedCommissionId || resolvedAoId
          ? undefined
          : selectedCommissionId,
    });

  const evaluation = overviewEvaluation ?? resolvedEvaluation;
  const evaluationId = evaluation?.id ?? "";
  const evaluationStatus = evaluation?.statut ?? "";

  const { data: membres, isLoading: loadingMembers } =
    useMembresEvaluationQuery(resolvedCommissionId);
  const { data: evaluationSubmissions, isLoading: loadingEvaluationSubmissions } =
    useCommissionEvaluationSubmissionsQuery(evaluationId);
  const { data: aoSubmissions, isLoading: loadingAoSubmissions } =
    useCommissionAoSubmissionsQuery(resolvedAoId);
  const { data: evaluationCriteria, isLoading: loadingEvaluationCriteria } =
    useCommissionEvaluationCriteriaQuery(evaluationId);
  const { data: aoCriteria, isLoading: loadingAoCriteria } =
    useCommissionAoCriteriaQuery(resolvedAoId, !evaluationCriteria?.length);
  const { data: anomalies } = useCommissionAoAnomaliesQuery(resolvedAoId);
  const queryClient = useQueryClient();
  const autoRegisterKeyRef = useRef<string | null>(null);

  const submissions = useMemo(() => {
    const evalItems = evaluationSubmissions ?? [];
    const aoItems = aoSubmissions ?? [];
    if (evalItems.length > 0) return evalItems;
    return aoItems;
  }, [aoSubmissions, evaluationSubmissions]);

  const activeSubmission = useMemo(() => {
    if (submissions.length === 0) return undefined;
    return (
      submissions.find((item) => item.id === activeSubmissionId) ??
      submissions[0]
    );
  }, [activeSubmissionId, submissions]);

  const criteria = useMemo(() => {
    const evalCriteria = evaluationCriteria ?? [];
    if (evalCriteria.length > 0) return evalCriteria;
    return aoCriteria ?? [];
  }, [aoCriteria, evaluationCriteria]);

  const activeEvaluationSubmissionId =
    activeSubmission?.source === "evaluation" ? activeSubmission.id : "";
  const { data: activeNotes, isLoading: loadingNotes } =
    useCommissionEvaluationNotesQuery(
      evaluationId,
      activeEvaluationSubmissionId,
      Boolean(activeEvaluationSubmissionId),
    );
  const saveScoresMutation = useSaveCommissionScoresMutation(evaluationId);

  const notesByCriterion = useMemo(() => {
    const map = new Map<string, CommissionEvaluationNote>();
    (activeNotes ?? [])
      .filter((note) => note.source !== "IA")
      .forEach((note) => map.set(note.criterionId, note));
    return map;
  }, [activeNotes]);

  const rows = useMemo(
    () =>
      criteria.map((criterion) => {
        const existing = notesByCriterion.get(criterion.id);
        const draft = activeSubmission
          ? draftScores[activeSubmission.id]?.[criterion.id]
          : undefined;
        const note =
          draft?.note ??
          (existing?.note !== undefined ? String(existing.note) : "");
        const justification = draft?.justification ?? existing?.justification ?? "";
        return { criterion, note, justification, existing };
      }),
    [activeSubmission, criteria, draftScores, notesByCriterion],
  );

  const scoredRows = rows.filter((row) => row.note.trim() !== "");
  const scoreActuel = rows.reduce((acc, row) => {
    const numeric = Number(row.note);
    if (!Number.isFinite(numeric)) return acc;
    return acc + (numeric * row.criterion.weight) / 100;
  }, 0);
  const completion =
    rows.length === 0 ? 0 : Math.round((scoredRows.length / rows.length) * 100);

  const membresList: MembreEvaluation[] = membres ?? [];
  const hasEvaluation = Boolean(evaluationId);
  const hasCriteria = criteria.length > 0;
  const hasEvaluationCriteria = Boolean(evaluationCriteria?.length);
  const isEvaluationOpen = evaluationStatus === "PRETE" || evaluationStatus === "EN_COURS";
  const canSaveNotes =
    Boolean(evaluationId) &&
    activeSubmission?.source === "evaluation" &&
    isEvaluationOpen &&
    hasEvaluationCriteria;
  const saveDisabledReason = !hasEvaluation
    ? "Le service evaluation n'a pas encore cree cette session."
    : activeSubmission?.source !== "evaluation"
      ? "Cette soumission vient de l'AO et n'est pas encore rattachee a l'evaluation."
      : !isEvaluationOpen
        ? `La notation est verrouillee car le statut est ${evaluationStatus || "inconnu"}.`
        : !hasEvaluationCriteria
          ? "Aucun critere d'evaluation n'est disponible dans le service evaluation."
          : "";

  const submissionsToRegister = useMemo(() => {
    if (!evaluationId || !isEvaluationOpen) return [];
    const registered = new Set(
      (evaluationSubmissions ?? []).map((item) => item.externalSubmissionId),
    );
    return (aoSubmissions ?? []).filter(
      (item) => item.externalSubmissionId && !registered.has(item.externalSubmissionId),
    );
  }, [aoSubmissions, evaluationId, evaluationSubmissions, isEvaluationOpen]);

  useEffect(() => {
    if (!evaluationId || !isEvaluationOpen || submissionsToRegister.length === 0) return;

    const autoRegisterKey = `${evaluationId}:${submissionsToRegister
      .map((item) => item.externalSubmissionId)
      .join("|")}`;
    if (autoRegisterKeyRef.current === autoRegisterKey) return;
    autoRegisterKeyRef.current = autoRegisterKey;

    let cancelled = false;

    (async () => {
      for (const submission of submissionsToRegister) {
        try {
          await registerCommissionEvaluationSubmission(evaluationId, {
            externalSubmissionId: submission.externalSubmissionId,
            operateurNom: submission.operatorName || undefined,
            lotId: submission.lotId || undefined,
            metadata: { source: submission.source },
          });
        } catch (error) {
          console.warn("Auto-registration of evaluation submission failed", error);
        }
      }

      if (!cancelled) {
        await queryClient.invalidateQueries({ queryKey: commissionKeys.evaluationSubmissions(evaluationId) });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [evaluationId, isEvaluationOpen, queryClient, submissionsToRegister]);

  const aiInsights = buildAiInsights({
    hasEvaluation,
    hasCriteria,
    canSaveNotes,
    currentSubmission: activeSubmission,
    anomaliesCount: anomalies?.totalAnomalies ?? 0,
    completion,
    score: scoreActuel,
  });

  const isPageLoading =
    loadingCommissions ||
    loadingOverview ||
    loadingResolvedEvaluation ||
    loadingMembers ||
    loadingEvaluationSubmissions ||
    loadingAoSubmissions ||
    loadingEvaluationCriteria ||
    loadingAoCriteria ||
    loadingNotes;

  const updateDraft = (
    submissionId: string,
    criterion: CommissionEvaluationCriterion,
    field: "note" | "justification",
    value: string,
  ) => {
    const nextValue =
      field === "note" ? clampScore(value, criterion.noteMax) : value;
    setDraftScores((prev) => ({
      ...prev,
      [submissionId]: {
        ...(prev[submissionId] ?? {}),
        [criterion.id]: {
          note:
            field === "note"
              ? nextValue
              : (prev[submissionId]?.[criterion.id]?.note ??
                (notesByCriterion.get(criterion.id)?.note !== undefined
                  ? String(notesByCriterion.get(criterion.id)?.note)
                  : "")),
          justification:
            field === "justification"
              ? nextValue
              : (prev[submissionId]?.[criterion.id]?.justification ??
                notesByCriterion.get(criterion.id)?.justification ??
                ""),
        },
      },
    }));
    setSaveMessage(null);
  };

  const saveCurrentSubmission = async () => {
    if (!activeSubmission || !canSaveNotes) return;
    const scores = rows
      .filter((row) => row.note.trim() !== "")
      .map((row) => ({
        submissionId: activeSubmission.id,
        criterionId: row.criterion.id,
        score: Number(row.note),
        justification: row.justification.trim() || "Notation commission.",
      }));

    if (scores.length === 0) {
      setSaveMessage("Renseignez au moins une note avant d'enregistrer.");
      return;
    }

    try {
      await saveScoresMutation.mutateAsync({ scores });
      setSaveMessage("Notes enregistrees pour la soumission active.");
    } catch (error) {
      console.error("Failed to save commission scores", error);
      setSaveMessage("Enregistrement refuse par le backend. Verifiez le statut de l'evaluation.");
    }
  };

  if (isPageLoading) {
    return (
      <div className="mx-auto w-full max-w-[1760px] space-y-6 p-4" style={{ direction: isAr ? "rtl" : "ltr" }}>
        <div className="h-36 animate-pulse rounded-[32px] bg-slate-100" />
        <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)_320px]">
          <div className="h-96 animate-pulse rounded-[28px] bg-slate-100" />
          <div className="h-96 animate-pulse rounded-[28px] bg-slate-100" />
          <div className="h-96 animate-pulse rounded-[28px] bg-slate-100 xl:col-span-2 2xl:col-span-1" />
        </div>
      </div>
    );
  }

  if (!selectedCommission && !evaluation) {
    return (
      <div className="p-4" style={{ direction: isAr ? "rtl" : "ltr" }}>
        <EmptyState
          title={isAr ? "لا توجد بيانات تقييم" : "Aucune donnee d'evaluation"}
          body={
            isAr
              ? "لم يعثر النظام على لجنة أو تقييم مرتبط بهذا الرابط."
              : "Le systeme ne trouve ni commission ni evaluation pour cet identifiant."
          }
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-full bg-[radial-gradient(circle_at_top_left,#eef7ef_0,#f6f8fb_34%,#edf2f7_100%)] p-4 text-slate-950 sm:p-5"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      <div className="mx-auto w-full max-w-[1760px] space-y-6">
      <section className="overflow-hidden rounded-[34px] border border-white/70 bg-white/85 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.55)] backdrop-blur">
        <div className="border-b border-slate-200/70 bg-[linear-gradient(135deg,#123524_0%,#1f4f37_48%,#d9b46f_100%)] p-5 text-white sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100">
                {isAr ? "فضاء التقييم التقني" : "Chambre de notation technique"}
              </p>
              <h1 className="mt-3 max-w-5xl break-words text-2xl font-black tracking-tight sm:text-3xl">
                {selectedCommission?.objet ?? evaluation?.objet ?? "Evaluation commission"}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1">
                  {selectedCommission?.reference ?? evaluation?.reference ?? selectedCommissionId}
                </span>
                <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1">
                  {evaluationStatus || selectedCommission?.statut || "ACTIVE"}
                </span>
                <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1">
                  AO {resolvedAoId ? resolvedAoId.slice(0, 8) : "non lie"}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {resolvedAoId ? (
                <Link
                  href={`/${locale}/dashboard/commission/classement/${resolvedAoId}`}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#123524] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  {isAr ? "عرض الترتيب" : "Voir classement"}
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Soumissions", value: submissions.length, detail: "offres chargees" },
            { label: "Criteres", value: criteria.length, detail: hasEvaluationCriteria ? "service evaluation" : "source AO/fallback" },
            { label: "Membres", value: membresList.length, detail: "commission active" },
            { label: "Session", value: hasEvaluation ? "EV" : "AO", detail: hasEvaluation ? "evaluation trouvee" : "pre-evaluation" },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{item.value}</p>
              <p className="text-xs text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <aside className="space-y-4 xl:sticky xl:top-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-950">
                {isAr ? "العروض" : "Soumissions"}
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {submissions.length}
              </span>
            </div>
            {submissions.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                Aucune soumission n&apos;est renvoyee pour cet appel d&apos;offres.
              </p>
            ) : (
              <div className="space-y-2">
                {submissions.map((submission, index) => {
                  const active = activeSubmission?.id === submission.id;
                  return (
                    <button
                      key={submission.id}
                      onClick={() => {
                        setActiveSubmissionId(submission.id);
                        setSaveMessage(null);
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-emerald-300 bg-emerald-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                            Soumission {index + 1}
                          </p>
                          <p className="mt-1 text-sm font-black text-slate-900">
                            {submission.reference}
                          </p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusTone(submission.status)}`}>
                          {submission.status || "N/A"}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        {sourceLabel(submission.source, isAr)}
                      </p>
                      {submission.scoreGlobal !== null && submission.scoreGlobal !== undefined ? (
                        <p className="mt-2 text-xs font-bold text-emerald-700">
                          Score global {submission.scoreGlobal} / 100
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-950">
                {isAr ? "أعضاء اللجنة" : "Membres"}
              </h2>
              <span className="text-xs font-bold text-slate-400">{membresList.length}</span>
            </div>
            <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
              {membresList.map((membre) => (
                <div key={membre.id} className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-sm font-bold text-slate-900">
                    {[membre.prenom, membre.nom].filter(Boolean).join(" ")}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">{membre.role}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          {!activeSubmission ? (
            <EmptyState
              title="Aucune soumission active"
              body="Les soumissions apparaitront ici des que le service soumission les renvoie pour l'appel d'offres."
            />
          ) : (
            <>
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                      {sourceLabel(activeSubmission.source, isAr)}
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">
                      {activeSubmission.reference}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {activeSubmission.operatorName} · lot {activeSubmission.lotId ?? "non precise"}
                    </p>
                  </div>
                  <div className="grid w-full grid-cols-3 gap-3 text-center lg:w-auto">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-bold text-slate-400">Score</p>
                      <p className="text-xl font-black text-emerald-700">{Math.round(scoreActuel)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-bold text-slate-400">Grille</p>
                      <p className="text-xl font-black text-slate-950">{completion}%</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-bold text-slate-400">Criteres</p>
                      <p className="text-xl font-black text-slate-950">{criteria.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {!hasEvaluation || !hasEvaluationCriteria ? (
                <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 text-amber-950">
                  <p className="font-black">
                    {hasEvaluation
                      ? "Evaluation creee, mais grille absente"
                      : "Session de notation non initialisee"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-800">
                    Les soumissions sont bien chargees depuis le service soumission.
                    La notation reste verrouillee tant que le service evaluation ne renvoie
                    pas une evaluation EN_COURS avec des criteres et des soumissions rattachees.
                  </p>
                </div>
              ) : null}

              {criteria.length === 0 ? (
                <EmptyState
                  title="Aucun critere d'evaluation"
                  body="Le service evaluation et le service appel d'offres renvoient une grille vide pour cet AO. Les notes ne peuvent pas etre saisies sans criteres auditables."
                />
              ) : (
                <div className="space-y-3">
                  {rows.map(({ criterion, note, justification, existing }, index) => {
                    const max = criterion.noteMax || 100;
                    const numeric = Number(note);
                    const percent = Number.isFinite(numeric)
                      ? Math.min(100, Math.max(0, (numeric / max) * 100))
                      : 0;
                    return (
                      <article
                        key={criterion.id}
                        className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                      >
                        <div className="border-b border-slate-100 p-5">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                Critere {index + 1} {criterion.code ? `· ${criterion.code}` : ""}
                              </p>
                              <h3 className="mt-2 text-lg font-black text-slate-950">
                                {criterion.label}
                              </h3>
                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                {criterion.description || "Critere de notation charge depuis le backend."}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                                Poids {criterion.weight}%
                              </span>
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                                / {max}
                              </span>
                              {criterion.noteEliminatoire !== undefined ? (
                                <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                                  Min {criterion.noteEliminatoire}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-5 p-5 lg:grid-cols-[180px_minmax(0,1fr)]">
                          <div>
                            <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                              Note
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={max}
                              value={note}
                              disabled={!canSaveNotes}
                              onChange={(event) =>
                                updateDraft(activeSubmission.id, criterion, "note", event.target.value)
                              }
                              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xl font-black text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white disabled:cursor-not-allowed disabled:text-slate-400"
                              placeholder="-"
                            />
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                              Justification
                            </label>
                            <textarea
                              rows={4}
                              value={justification}
                              disabled={!canSaveNotes}
                              onChange={(event) =>
                                updateDraft(activeSubmission.id, criterion, "justification", event.target.value)
                              }
                              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white disabled:cursor-not-allowed disabled:text-slate-400"
                              placeholder="Motiver la note attribuee..."
                            />
                            {existing ? (
                              <p className="mt-2 text-xs font-semibold text-slate-400">
                                Derniere note enregistree: {existing.note} / {max}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="sticky bottom-4 z-10 rounded-[26px] border border-slate-200 bg-white/95 p-4 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.55)] backdrop-blur">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-950">
                      {canSaveNotes ? "Pret a enregistrer" : "Notation verrouillee"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {canSaveNotes
                        ? `${scoredRows.length}/${rows.length} criteres renseignes pour cette soumission.`
                        : saveDisabledReason}
                    </p>
                    {saveMessage ? (
                      <p className="mt-2 text-xs font-bold text-emerald-700">{saveMessage}</p>
                    ) : null}
                  </div>
                  <button
                    onClick={saveCurrentSubmission}
                    disabled={!canSaveNotes || saveScoresMutation.isPending}
                    className="rounded-2xl bg-[#123524] px-6 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#1f4f37] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                  >
                    {saveScoresMutation.isPending ? "Enregistrement..." : "Enregistrer les notes"}
                  </button>
                </div>
              </div>
            </>
          )}
        </main>

        <aside className="space-y-4 xl:col-span-2 2xl:col-span-1">
          <div className="overflow-hidden rounded-[30px] border border-[#123524]/20 bg-[#101f1a] text-white shadow-[0_30px_90px_-45px_rgba(16,31,26,0.8)] 2xl:sticky 2xl:top-4">
            <div className="border-b border-white/10 bg-white/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d9b46f]">
                Assistant IA Al-Mizan
              </p>
              <h2 className="mt-2 text-xl font-black">Lecture de readiness</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Analyse basee sur les reponses des services commission, evaluation et soumission.
              </p>
            </div>
            <div className="space-y-3 p-4">
              {aiInsights.map((insight) => (
                <div
                  key={insight.title}
                  className={`rounded-2xl border p-4 ${
                    insight.tone === "good"
                      ? "border-emerald-400/20 bg-emerald-400/10"
                      : insight.tone === "warn"
                        ? "border-amber-300/25 bg-amber-300/10"
                        : "border-white/10 bg-white/5"
                  }`}
                >
                  <p className="text-sm font-black">{insight.title}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-300">{insight.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-black text-slate-950">Etat backend</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Commission", resolvedCommissionId ? "OK" : "Manquante"],
                ["AO", resolvedAoId ? "OK" : "Non lie"],
                ["Evaluation", hasEvaluation ? evaluationStatus || "OK" : "Absente"],
                ["Criteres evaluation", hasEvaluationCriteria ? `${evaluationCriteria?.length}` : "0"],
                ["Criteres AO", `${aoCriteria?.length ?? 0}`],
                ["Anomalies IA", `${anomalies?.totalAnomalies ?? 0}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-black text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Reunion: {formatDate(selectedCommission?.dateReunion, locale)}
            </p>
          </div>
        </aside>
      </section>
      </div>
    </div>
  );
}
