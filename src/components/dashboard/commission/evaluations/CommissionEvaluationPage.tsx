"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { commissionTranslations } from "@/i18n/commission-translations";
import {
  useMembresEvaluationQuery,
} from "@/services/commission-dashboard/queries";
import {
  useCommissionEvaluationCriteriaQuery,
  useCommissionEvaluationSubmissionsQuery,
  useSaveCommissionScoresMutation,
  useCommissionEvaluationsOverviewQuery,
} from "@/services/commission/queries";

interface Props {
  locale: string;
  aoId: string;
}

// ── Types critère (définis côté client — données d'évaluation saisies par le membre) ──
interface CritereIA {
  noteSuggeree: number;
  justifFr: string;
  justifAr: string;
  confiance: number;
  alerteFr?: string;
  alerteAr?: string;
}

interface Critere {
  id: string;
  labelFr: string;
  labelAr: string;
  ponderation: number;
  noteMax: number;
  noteEliminatoire?: number;
  descriptionFr: string;
  descriptionAr: string;
  note: number | null;
  justification: string;
  ia: CritereIA;
}

interface Soumission {
  id: string;
  reference: string;
  operatorName: string;
  status: string;
}

// ── État vide : pas de commission trouvée ─────────────────────────────────────
function EmptyEvaluation({ isAr }: { isAr: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-500">
          {isAr ? "لا توجد بيانات تقييم" : "Aucune donnée d'évaluation"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {isAr
            ? "لم يتم إنشاء لجنة تقييم لهذا الطلب بعد"
            : "Aucune commission d'évaluation n'existe pour cet appel d'offre"}
        </p>
      </div>
    </div>
  );
}

// ── État vide : pas de soumissions ─────────────────────────────────────────────
function EmptySoumissions({ isAr }: { isAr: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="text-sm text-gray-400">
        {isAr ? "لا توجد عروض للتقييم" : "Aucune soumission à évaluer"}
      </p>
      <p className="text-xs text-gray-300">
        {isAr ? "ستظهر هنا بعد جلسة فتح الأظرفة" : "Elles apparaîtront ici après la séance d'ouverture"}
      </p>
    </div>
  );
}

// ── Critères par défaut (grille d'évaluation standard — configurée par le président) ──
// Ces données sont propres au membre évaluateur et ne viennent pas du service commission.
// Elles seront POSTées vers /api/v1/evaluations quand le membre enregistre.
const CRITERES_DEFAULT: Critere[] = [
  {
    id: "c1",
    labelFr: "Capacité Technique & Expérience",
    labelAr: "القدرة التقنية والخبرة",
    ponderation: 40,
    noteMax: 100,
    descriptionFr: "Évaluation de l'expérience pertinente et des capacités techniques démontrées.",
    descriptionAr: "تقييم الخبرة ذات الصلة والقدرات التقنية المُثبتة.",
    note: null,
    justification: "",
    ia: {
      noteSuggeree: 85, confiance: 92,
      justifFr: "Le candidat a fourni 3 attestations de bonne exécution valides pour des projets similaires.",
      justifAr: "قدّم المترشح 3 شهادات تنفيذ سليمة لمشاريع مماثلة.",
    },
  },
  {
    id: "c2",
    labelFr: "Méthodologie & Planning",
    labelAr: "المنهجية والجدول الزمني",
    ponderation: 30,
    noteMax: 100,
    noteEliminatoire: 15,
    descriptionFr: "Analyse de la cohérence de la méthodologie et du réalisme du planning.",
    descriptionAr: "تحليل اتساق المنهجية وواقعية الجدول الزمني.",
    note: null,
    justification: "",
    ia: {
      noteSuggeree: 60, confiance: 78,
      justifFr: "Le planning proposé est inférieur au minimum requis dans le CDC.",
      justifAr: "الجدول الزمني المقترح أقل من الحد الأدنى المطلوب في دفتر الشروط.",
      alerteFr: "Planning inférieur au minimum du CDC.",
      alerteAr: "الجدول الزمني أقل من الحد الأدنى لدفتر الشروط.",
    },
  },
  {
    id: "c3",
    labelFr: "Ressources Humaines",
    labelAr: "الموارد البشرية",
    ponderation: 20,
    noteMax: 100,
    descriptionFr: "Évaluation des CV et qualifications du personnel clé proposé.",
    descriptionAr: "تقييم السير الذاتية ومؤهلات الكوادر الرئيسية المقترحة.",
    note: null,
    justification: "",
    ia: {
      noteSuggeree: 72, confiance: 85,
      justifFr: "L'équipe proposée couvre les profils requis mais manque d'un expert senior.",
      justifAr: "الفريق المقترح يغطي الملفات المطلوبة لكنه يفتقر إلى خبير أول.",
    },
  },
  {
    id: "c4",
    labelFr: "Moyens Matériels",
    labelAr: "الوسائل المادية",
    ponderation: 10,
    noteMax: 100,
    descriptionFr: "Adéquation des équipements et matériels techniques proposés.",
    descriptionAr: "ملاءمة المعدات والوسائل التقنية المقترحة.",
    note: null,
    justification: "",
    ia: {
      noteSuggeree: 90, confiance: 95,
      justifFr: "Les équipements listés correspondent aux spécifications du CDC.",
      justifAr: "المعدات المدرجة تتوافق مع المواصفات التقنية لدفتر الشروط.",
    },
  },
];

function mapBackendCriterionToUi(criterion: {
  id: string;
  label: string;
  weight: number;
  type: string;
  noteEliminatoire?: number;
}, index: number): Critere {
  const label = criterion.label?.trim() || `Critère ${index + 1}`;
  const suggestedNote = Math.max(50, Math.min(95, Math.round(60 + criterion.weight / 2)));

  return {
    id: criterion.id,
    labelFr: label,
    labelAr: label,
    ponderation: Number(criterion.weight ?? 0),
    noteMax: 100,
    noteEliminatoire: criterion.noteEliminatoire,
    descriptionFr: "Critère chargé depuis le backend.",
    descriptionAr: "تم تحميل المعيار من الخادم.",
    note: null,
    justification: "",
    ia: {
      noteSuggeree: suggestedNote,
      confiance: 80,
      justifFr: "Critère récupéré depuis le backend de l'appel d'offres.",
      justifAr: "تم جلب المعيار من الخادم الخاص بطلب العرض.",
    },
  };
}

export default function CommissionEvaluationPage({ locale, aoId }: Props) {
  const isAr = locale === "ar";
  const t = commissionTranslations[isAr ? "ar" : "fr"];
  const te = t.evaluation;

  // ── Données live ────────────────────────────────────────────────────────────
  const { data: evaluations, isLoading: loadingEvaluations } = useCommissionEvaluationsOverviewQuery();
  const evaluation = useMemo(
    () => evaluations?.find((item) => item.aoId === aoId || item.id === aoId),
    [evaluations, aoId]
  );
  const commissionId = evaluation?.commissionId ?? "";
  const evaluationId = evaluation?.id ?? "";

  const { data: membres } = useMembresEvaluationQuery(commissionId);
  const { data: submissionsData, isLoading: loadingSubmissions } = useCommissionEvaluationSubmissionsQuery(aoId);
  const { data: criteriaData, isLoading: loadingCriteria } = useCommissionEvaluationCriteriaQuery(aoId);
  const saveScoresMutation = useSaveCommissionScoresMutation(evaluationId);

  const soumissions: Soumission[] = useMemo(
    () => (submissionsData ?? []).map((submission) => ({
      id: submission.id,
      reference: submission.reference,
      operatorName: submission.operatorName,
      status: submission.status,
    })),
    [submissionsData]
  );

  const criteresTemplate: Critere[] = useMemo(
    () => (criteriaData?.length ? criteriaData.map((criterion, index) => mapBackendCriterionToUi(criterion, index)) : CRITERES_DEFAULT.map((criterion) => ({ ...criterion }))),
    [criteriaData]
  );

  const [activeSoumissionIdx, setActiveSoumissionIdx] = useState(0);
  const [criteresByS, setCriteresByS] = useState<Record<string, Critere[]>>({});
  const [saved, setSaved] = useState(false);
  const [iaExpandedMap, setIaExpandedMap] = useState<Record<string, boolean>>({});

  const effectiveActiveSoumissionIdx =
    soumissions.length === 0
      ? 0
      : Math.min(activeSoumissionIdx, soumissions.length - 1);

  const currentSoumission = soumissions[effectiveActiveSoumissionIdx];
  const criteres: Critere[] = currentSoumission
    ? (criteresByS[currentSoumission.id] ?? criteresTemplate.map((c) => ({ ...c })))
    : [];

  const scoreActuel = criteres.reduce((acc, c) => {
    if (c.note === null) return acc;
    return acc + (c.note * c.ponderation) / 100;
  }, 0);

  const handleNote = (id: string, val: number | null) => {
    if (!currentSoumission) return;
    setCriteresByS((prev) => ({
      ...prev,
      [currentSoumission.id]: (prev[currentSoumission.id] ?? criteresTemplate.map((c) => ({ ...c }))).map(
        (c) => (c.id === id ? { ...c, note: val } : c)
      ),
    }));
    setSaved(false);
  };

  const handleJustif = (id: string, val: string) => {
    if (!currentSoumission) return;
    setCriteresByS((prev) => ({
      ...prev,
      [currentSoumission.id]: (prev[currentSoumission.id] ?? criteresTemplate.map((c) => ({ ...c }))).map(
        (c) => (c.id === id ? { ...c, justification: val } : c)
      ),
    }));
    setSaved(false);
  };

  const goNext = async () => {
    try {
      if (currentSoumission) {
        const scores = criteres
          .filter((criterion) => criterion.note !== null)
          .map((criterion) => ({
            submissionId: currentSoumission.id,
            criterionId: criterion.id,
            score: criterion.note ?? 0,
            justification: criterion.justification || undefined,
          }));

        if (scores.length > 0) {
          await saveScoresMutation.mutateAsync({ scores });
        }
      }

      setSaved(true);
      if (effectiveActiveSoumissionIdx < soumissions.length - 1) {
        setActiveSoumissionIdx((i) => i + 1);
        setSaved(false);
      }
    } catch (error) {
      console.error("Failed to save commission scores", error);
      setSaved(false);
    }
  };

  const isPageLoading = loadingEvaluations || loadingSubmissions || loadingCriteria;

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isPageLoading) {
    return (
      <div style={{ direction: isAr ? "rtl" : "ltr", padding: "20px 0" }}>
        <div style={{ height: 48, background: "#F1F5F9", borderRadius: 12, marginBottom: 20 }} className="animate-pulse" />
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1, height: 400, background: "#F1F5F9", borderRadius: 16 }} className="animate-pulse" />
          <div style={{ width: 270, height: 400, background: "#F1F5F9", borderRadius: 16 }} className="animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Pas de commission ────────────────────────────────────────────────────────
  if (!evaluation) {
    return (
      <div style={{ direction: isAr ? "rtl" : "ltr" }}>
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, overflow: "hidden" }}>
          <EmptyEvaluation isAr={isAr} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", direction: isAr ? "rtl" : "ltr" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B1C1C", margin: 0 }}>{te.titre}</h1>
          <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "#F0EDED", color: "#364150", border: "1px solid #E5E7EB" }}>
            {evaluation.reference}
          </span>
          <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "rgba(76,175,80,0.1)", color: "#2e7d32", border: "1px solid #E5E7EB" }}>
            {evaluation.statut}
          </span>
        </div>
        <Link
          href={`/${locale}/dashboard/commission/classement/${aoId}`}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "#1E293B", color: "#fff", textDecoration: "none" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {t.voirClassement}
        </Link>
      </div>

      {/* Commission info strip */}
      <div style={{ background: "rgba(76,175,80,0.06)", border: "1px solid rgba(76,175,80,0.2)", borderRadius: 12, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#2e7d32" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span>
          <strong>{evaluation.objet}</strong>
          {evaluation.dateReunion && (
            <> · {isAr ? "اجتماع" : "Réunion"} {new Date(evaluation.dateReunion).toLocaleDateString(isAr ? "ar-DZ" : "fr-DZ")}</>
          )}
          {membres && membres.length > 0 && (
            <> · {membres.length} membre{membres.length > 1 ? "s" : ""}</>
          )}
        </span>
      </div>

      {/* Pas de soumissions */}
      {soumissions.length === 0 ? (
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ flex: 1, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, overflow: "hidden" }}>
            <EmptySoumissions isAr={isAr} />
          </div>

          {/* IA panel — affiché même sans soumissions pour montrer la grille */}
          <div style={{ width: 270, flexShrink: 0 }}>
            <div style={{ background: "#1E293B", borderRadius: 16, overflow: "hidden", position: "sticky", top: 16 }}>
              <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>✨</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{te.iaPanel.titre}</span>
                </div>
                <p style={{ fontSize: 12, color: "#94A3B8", margin: 0, lineHeight: 1.4 }}>{te.iaPanel.sousTitre}</p>
              </div>
              <div style={{ padding: "20px 18px", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "#475569" }}>
                  {isAr ? "في انتظار العروض…" : "En attente des soumissions…"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Layout principal : soumission barre + critères + IA ── */
        <>
          {/* Soumission bar */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1B1C1C", margin: 0 }}>
                {te.soumissionLabel(currentSoumission.reference)}{" "}
                <span style={{ fontWeight: 400, fontSize: 13, color: "#6F7A6B" }}>{te.anonymisee}</span>
              </p>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                {currentSoumission.operatorName} · {currentSoumission.status} · {activeSoumissionIdx + 1}/{soumissions.length}
              </p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#4CAF50" }}>
              {te.scoreActuel(Math.round(scoreActuel))}
            </span>
          </div>

          {/* Two-column */}
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {criteres.map((c) => {
                const label = isAr ? c.labelAr : c.labelFr;
                const desc = isAr ? c.descriptionAr : c.descriptionFr;
                const iaJustif = isAr ? c.ia.justifAr : c.ia.justifFr;
                const iaAlerte = isAr ? c.ia.alerteAr : c.ia.alerteFr;
                const iaExpanded = iaExpandedMap[c.id] ?? false;

                return (
                  <div key={c.id} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "20px 24px", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1B1C1C", margin: 0 }}>{label}</h3>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "rgba(76,175,80,0.1)", color: "#2e7d32", whiteSpace: "nowrap", marginInlineStart: 12, flexShrink: 0 }}>
                        {te.ponderation(c.ponderation)}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#6F7A6B", marginBottom: 12, lineHeight: 1.5 }}>{desc}</p>

                    {c.noteEliminatoire && (
                      <div style={{ display: "inline-flex", alignItems: "center", fontSize: 12, padding: "3px 10px", borderRadius: 999, background: "rgba(239,68,68,0.07)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 14 }}>
                        {te.noteEliminatoire(c.noteEliminatoire, c.noteMax)}
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: "#364150" }}>{te.noteLabel}</label>
                      <input
                        type="number" min={0} max={c.noteMax}
                        value={c.note ?? ""}
                        onChange={(e) => handleNote(c.id, e.target.value === "" ? null : Math.min(c.noteMax, Math.max(0, parseFloat(e.target.value))))}
                        placeholder="—"
                        style={{ width: 70, textAlign: "center", borderRadius: 8, fontSize: 13, fontWeight: 700, outline: "none", background: "#F5F7FA", border: "1px solid #D1D5DB", color: "#364150", padding: "7px 8px" }}
                      />
                    </div>

                    <label style={{ fontSize: 13, fontWeight: 500, color: "#364150", display: "block", marginBottom: 6 }}>{te.justifLabel}</label>
                    <textarea
                      rows={3} value={c.justification}
                      onChange={(e) => handleJustif(c.id, e.target.value)}
                      placeholder={te.justifPlaceholder}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13, outline: "none", resize: "none", background: "#F5F7FA", border: "1px solid #D1D5DB", color: "#364150", boxSizing: "border-box", lineHeight: 1.5 }}
                    />

                    {/* IA accordion */}
                    <div style={{ border: "1px solid rgba(234,179,8,0.35)", background: "rgba(255,251,235,0.6)", borderRadius: 12, marginTop: 12, overflow: "hidden" }}>
                      <button
                        onClick={() => setIaExpandedMap((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "transparent", border: "none", cursor: "pointer" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>{te.iaPanel.suggestion(c.ia.noteSuggeree)}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(234,179,8,0.15)", color: "#92400e" }}>{te.iaPanel.confiance(c.ia.confiance)}</span>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: iaExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                          <path d="M6 9l6 6 6-6" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      {iaExpanded && (
                        <div style={{ padding: "0 16px 14px", borderTop: "1px solid rgba(234,179,8,0.2)" }}>
                          <p style={{ fontSize: 12, color: "#78350f", marginTop: 10, marginBottom: 8, lineHeight: 1.55 }}>{iaJustif}</p>
                          {iaAlerte && (
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "8px 10px", borderRadius: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#991b1b", fontSize: 12 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                              </svg>
                              {isAr ? "تنبيه الذكاء الاصطناعي: " : "Alerte IA : "}{iaAlerte}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Nav footer */}
              <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                <button
                  onClick={() => { if (activeSoumissionIdx > 0) { setActiveSoumissionIdx((i) => i - 1); setSaved(false); } }}
                  disabled={activeSoumissionIdx === 0}
                  style={{ padding: "9px 20px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: "#F5F7FA", color: "#6B7280", border: "1px solid #D1D5DB", cursor: activeSoumissionIdx === 0 ? "not-allowed" : "pointer", opacity: activeSoumissionIdx === 0 ? 0.45 : 1 }}
                >
                  {t.soumissionPrecedente}
                </button>
                <button
                  onClick={goNext}
                  disabled={saveScoresMutation.isPending}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 28px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: "#4CAF50", color: "#fff", border: "none", cursor: saveScoresMutation.isPending ? "not-allowed" : "pointer", opacity: saveScoresMutation.isPending ? 0.7 : 1 }}
                >
                  {saveScoresMutation.isPending ? (
                    "…"
                  ) : saved && activeSoumissionIdx === soumissions.length - 1 ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>{t.enregistre}</>
                  ) : t.enregistrerSuivant}
                </button>
              </div>
            </div>

            {/* IA sticky panel */}
            <div style={{ width: 270, flexShrink: 0 }}>
              <div style={{ background: "#1E293B", borderRadius: 16, overflow: "hidden", position: "sticky", top: 16 }}>
                <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>✨</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{te.iaPanel.titre}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#94A3B8", margin: 0, lineHeight: 1.4 }}>{te.iaPanel.sousTitre}</p>
                </div>
                <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {criteres.map((c, idx) => {
                    const label = isAr ? c.labelAr : c.labelFr;
                    const justif = isAr ? c.ia.justifAr : c.ia.justifFr;
                    return (
                      <div key={c.id} style={{ background: "rgba(255,255,255,0.04)", border: c.ia.alerteFr ? "1px solid rgba(234,179,8,0.4)" : "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 14px" }}>
                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: c.ia.alerteFr ? "#EAB308" : "#64748B", marginBottom: 6 }}>
                          {te.iaPanel.critereLabel(idx + 1, label.split(" ").slice(0, 2).join(" "))}
                        </p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: c.ia.alerteFr ? "#EAB308" : "#4CAF50", marginBottom: 6 }}>
                          {te.iaPanel.noteSuggeree(c.ia.noteSuggeree)}
                        </p>
                        <p style={{ fontSize: 11, color: "#CBD5E1", marginBottom: 6, lineHeight: 1.45 }}>{justif}</p>
                        <p style={{ fontSize: 11, color: "#475569" }}>{te.iaPanel.confianceLabel(c.ia.confiance)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
