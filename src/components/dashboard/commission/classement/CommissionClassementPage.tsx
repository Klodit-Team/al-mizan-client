"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { commissionTranslations } from "@/i18n/commission-translations";
import {
  useMesCommissionsQuery,
  useMembresEvaluationQuery,
  useChangeStatutEvaluationMutation,
  useCommissionEvaluationQuery,
} from "@/services/commission-dashboard/queries";
import {
  useCommissionClassementQuery,
  useCommissionEvaluationsOverviewQuery,
} from "@/services/commission/queries";
import { exportCommissionEvaluationPdf } from "@/services/commission-dashboard/api";

interface Props {
  locale: string;
  aoId: string;
}

type RecType = "Retenir" | "Analyser Plus" | "Eliminer";
type DecType = "Retenir" | "En attente" | "Elimine" | null;
type CommissionClassementDict = (typeof commissionTranslations)[keyof typeof commissionTranslations]["classement"];

interface LigneClassement {
  rang: number | null;
  operateur: string;
  scoreCommission: number;
  scoreIA: number;
  ecart: number;
  divergence: boolean;
  recommandationIA: RecType;
  decisionFinale: DecType;
  motifElimination?: string;
  motifEliminationAr?: string;
  elimine: boolean;
}

type CommissionEvaluationWithAo = {
  id: string;
  aoId?: string | null;
  appelOffreId?: string | null;
};

const REC_STYLES: Record<RecType, { bg: string; color: string }> = {
  Retenir: { bg: "rgba(76,175,80,0.12)", color: "#2e7d32" },
  "Analyser Plus": { bg: "rgba(234,179,8,0.12)", color: "#92400e" },
  Eliminer: { bg: "rgba(239,68,68,0.08)", color: "#991b1b" },
};

const COL_TEMPLATE = "60px minmax(120px,1fr) 140px 120px 130px 130px 140px";

// Ligne squelette pendant le chargement
function SkeletonRow() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: COL_TEMPLATE, padding: "16px 24px", gap: 8, borderBottom: "1px solid #F3F4F6", alignItems: "center" }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="animate-pulse" style={{ height: 14, borderRadius: 6, background: "#F1F5F9", width: `${50 + (i * 11) % 40}%` }} />
      ))}
    </div>
  );
}

// État vide
function EmptyClassement({ isAr }: { isAr: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "72px 24px", gap: 16 }}>
      <div style={{ width: 60, height: 60, borderRadius: 18, background: "#F8FAFC", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M7 17V13H11V17H7ZM13 17V7H17V17H13Z" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", margin: "0 0 4px" }}>
          {isAr ? "لا يوجد تصنيف بعد" : "Aucun classement disponible"}
        </p>
        <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>
          {isAr ? "لم يتم تسجيل أي نقطة تقييم بعد" : "Les scores d'évaluation n'ont pas encore été saisis"}
        </p>
      </div>
    </div>
  );
}

function DecisionDropdown({ current, onChange, t }: { current: DecType; onChange: (d: DecType) => void; t: CommissionClassementDict }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const OPTIONS = [
    { label: t.decisions.retenir, value: "Retenir" as DecType, bg: "#fff", color: "#2e7d32", border: "#4CAF50" },
    { label: t.decisions.attente, value: "En attente" as DecType, bg: "#FEF9C3", color: "#92400e", border: "#EAB308" },
    { label: t.decisions.elimine, value: "Elimine" as DecType, bg: "#FEE2E2", color: "#991b1b", border: "#EF4444" },
  ];

  const selected = OPTIONS.find((o) => o.value === current);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const menuH = 108;
      const top = window.innerHeight - rect.bottom >= menuH + 8 ? rect.bottom + 4 : rect.top - menuH - 4;
      setMenuPos({ top, left: rect.left });
    };
    update();
    window.addEventListener("scroll", update, true);
    return () => window.removeEventListener("scroll", update, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!btnRef.current?.contains(e.target as Node) && !menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button ref={btnRef} onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: selected?.bg ?? "#fff", color: selected?.color ?? "#364150", border: `1px solid ${selected?.border ?? "#D1D5DB"}`, cursor: "pointer", minWidth: 110 }}>
        {selected?.label ?? "—"}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginInlineStart: "auto" }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div ref={menuRef} style={{ position: "fixed", top: menuPos.top, left: menuPos.left, zIndex: 9999, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.18)", border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden", minWidth: 130 }}>
          {OPTIONS.map((o) => (
            <button key={String(o.value)} onClick={() => { onChange(o.value); setOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", fontSize: 13, color: o.color, background: "transparent", border: "none", cursor: "pointer" }}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfirmModal({ t, onConfirm, onCancel }: { t: CommissionClassementDict; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 420, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="#EF4444" strokeWidth="2" />
            </svg>
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#364150", margin: 0 }}>{t.confirmTitre}</h2>
        </div>
        <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6, marginBottom: 22 }}>{t.confirmTexte}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: "#F3F4F6", color: "#6B7280", border: "none", cursor: "pointer" }}>{t.annuler}</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "10px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: "#364150", color: "#fff", border: "none", cursor: "pointer" }}>{t.confirmer}</button>
        </div>
      </div>
    </div>
  );
}

export default function CommissionClassementPage({ locale, aoId }: Props) {
  const isAr = locale === "ar";
  const t = commissionTranslations[isAr ? "ar" : "fr"];
  const tc = t.classement;

  const { data: mesCommissions, isLoading: loadingEvaluations } = useMesCommissionsQuery();
  const { data: evaluationOverview, isLoading: loadingOverview } =
    useCommissionEvaluationsOverviewQuery();
  const selectedCommission = useMemo(
    () =>
      (mesCommissions?.commissionsEvaluation as CommissionEvaluationWithAo[] | undefined)?.find(
        (item) => item.id === aoId,
      ) ?? null,
    [mesCommissions, aoId]
  );
  const evaluationRecord = useMemo(
    () =>
      evaluationOverview?.find(
        (item) => item.commissionId === aoId || item.id === aoId,
      ) ?? null,
    [evaluationOverview, aoId]
  );
  const seance = useMemo(
    () =>
      mesCommissions?.seancesOuverture.find(
        (item) =>
          item.commissionId === selectedCommission?.id ||
          item.commissionId === evaluationRecord?.commissionId,
      ) ?? null,
    [mesCommissions, selectedCommission?.id, evaluationRecord?.commissionId]
  );
  const commissionId = selectedCommission?.id ?? evaluationRecord?.commissionId ?? "";
  const { data: evaluation } = useCommissionEvaluationQuery(commissionId);
  const resolvedAoId =
    seance?.appelOffreId ??
    selectedCommission?.appelOffreId ??
    selectedCommission?.aoId ??
    evaluationRecord?.aoId ??
    "";

  const { data: membres } = useMembresEvaluationQuery(commissionId);
  const { data: backendClassement, isLoading: loadingClassement } =
    useCommissionClassementQuery(resolvedAoId);
  const changeStatutMutation = useChangeStatutEvaluationMutation(commissionId);

  // Les lignes de classement viendront du service évaluations
  // GET /api/v1/evaluations/:id/classement — pour l'instant vide jusqu'à branchement
  const [lignes, setLignes] = useState<LigneClassement[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validated, setValidated] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const mappedRows: LigneClassement[] = (backendClassement ?? []).map((row) => {
      const decision = row.decision === "retenu"
        ? "Retenir"
        : row.decision === "elimine"
          ? "Elimine"
          : "En attente";

      return {
        rang: row.rank,
        operateur: row.operatorName,
        scoreCommission: row.scoreGlobal,
        scoreIA: row.scoreGlobal,
        ecart: 0,
        divergence: false,
        recommandationIA: decision === "Elimine" ? "Eliminer" : decision === "Retenir" ? "Retenir" : "Analyser Plus",
        decisionFinale: decision,
        elimine: row.decision === "elimine",
      };
    });

    setLignes(mappedRows);
  }, [backendClassement]);

  const handleDecision = (idx: number, d: DecType) =>
    setLignes((prev) => prev.map((l, i) => (i === idx ? { ...l, decisionFinale: d } : l)));

  const handleValidate = async () => {
    setShowConfirm(false);
    setValidated(true);
    try { await changeStatutMutation.mutateAsync({ statut: "CLOTUREE" }); } catch {}
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try { await exportCommissionEvaluationPdf(commissionId || resolvedAoId); } finally { setIsExporting(false); }
  };

  const recLabel = (rec: RecType) =>
    rec === "Retenir" ? tc.recs.retenir : rec === "Analyser Plus" ? tc.recs.analyser : tc.recs.eliminer;

  const totalSoumissions = lignes.length;
  const rejetees = lignes.filter((l) => l.elimine).length;
  const eligibles = totalSoumissions - rejetees;
  const isPageLoading = loadingEvaluations || loadingOverview || loadingClassement;

  return (
    <div style={{ minHeight: "100%", direction: isAr ? "rtl" : "ltr" }}>
      {showConfirm && <ConfirmModal t={tc} onConfirm={handleValidate} onCancel={() => setShowConfirm(false)} />}

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B1C1C", margin: 0 }}>{tc.titre}</h1>
          <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: "#F0EDED", color: "#364150", border: "1px solid #E5E7EB" }}>{t.commissionBadge}</span>
          {evaluation && (
            <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, background: evaluation.statut === "ACTIVE" ? "rgba(76,175,80,0.1)" : "#F0EDED", color: evaluation.statut === "ACTIVE" ? "#2e7d32" : "#364150", border: "1px solid #E5E7EB" }}>
              {evaluation.statut}
            </span>
          )}
        </div>
        <button onClick={handleExportPdf} disabled={isExporting || loadingEvaluations}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "#fff", color: "#364150", border: "1px solid #E5E7EB", cursor: (isExporting || loadingEvaluations) ? "not-allowed" : "pointer", opacity: (isExporting || loadingEvaluations) ? 0.5 : 1 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {isExporting ? (isAr ? "جارٍ التصدير…" : "Export en cours…") : tc.genererRapport}
        </button>
      </div>

      {/* AO + stats */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
        {loadingEvaluations ? (
          <>
            <div className="animate-pulse" style={{ height: 22, width: "40%", background: "#F1F5F9", borderRadius: 6, marginBottom: 8 }} />
            <div className="animate-pulse" style={{ height: 14, width: "60%", background: "#F1F5F9", borderRadius: 6, marginBottom: 18 }} />
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1B1C1C", margin: "0 0 4px" }}>
              {selectedCommission?.objet ?? evaluationRecord?.objet ?? tc.sousTitre(aoId)}
            </h2>
            <p style={{ fontSize: 13, color: "#6F7A6B", marginBottom: 18 }}>
              {selectedCommission?.reference ?? evaluationRecord?.reference ?? aoId}
              {membres && membres.length > 0 && ` · ${membres.length} membre${membres.length > 1 ? "s" : ""}`}
              {" · "}{tc.etape}
            </p>
          </>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[
            { key: tc.stats.traites, val: totalSoumissions, color: "#1B1C1C" },
            { key: tc.stats.rejetees, val: rejetees, color: "#EF4444" },
            { key: tc.stats.eligibles, val: eligibles, color: "#4CAF50" },
          ].map((s) => (
            <div key={s.key} style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 12, padding: "12px 16px" }}>
              <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 4px" }}>{s.key}</p>
                {loadingEvaluations ? (
                  <div className="animate-pulse" style={{ height: 30, width: 40, background: "#E5E7EB", borderRadius: 6 }} />
                ) : (
                  <p style={{ fontSize: 30, fontWeight: 900, color: s.color, margin: 0 }}>
                    {String(s.val).padStart(2, "0")}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, marginBottom: 20 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #F3F4F6" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1B1C1C", margin: "0 0 3px" }}>{tc.table.titre}</h3>
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>{tc.table.sousTitre}</p>
        </div>

        {!loadingEvaluations && lignes.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: COL_TEMPLATE, padding: "10px 24px", background: "#F8FAFC", borderBottom: "1px solid #F3F4F6", gap: 8 }}>
            {tc.table.cols.map((col: string) => (
              <span key={col} style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em" }}>{col}</span>
            ))}
          </div>
        )}

        {isPageLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
        ) : lignes.length === 0 ? (
          <EmptyClassement isAr={isAr} />
        ) : (
          lignes.map((ligne, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: COL_TEMPLATE, padding: "16px 24px", alignItems: "center", gap: 8, borderBottom: idx < lignes.length - 1 ? "1px solid #F3F4F6" : "none", background: ligne.divergence ? "rgba(234,179,8,0.04)" : "transparent", opacity: ligne.elimine ? 0.6 : 1 }}>
              <div>
                {ligne.rang ? (
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", fontSize: 11, fontWeight: 800, color: "#fff", background: ligne.rang === 1 ? "#4CAF50" : "#94A3B8" }}>
                    {ligne.rang === 1 ? tc.rangs.premier : tc.rangs.nieme(ligne.rang)}
                  </span>
                ) : <span style={{ color: "#9CA3AF", fontSize: 14 }}>—</span>}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: ligne.elimine ? "#9CA3AF" : "#364150", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ligne.operateur}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: ligne.elimine ? "#9CA3AF" : "#364150", textDecoration: ligne.elimine ? "line-through" : "none" }}>{ligne.scoreCommission.toFixed(1)} / 100</span>
              <span style={{ fontSize: 13, color: "#6F7A6B" }}>{ligne.scoreIA.toFixed(1)} / 100</span>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: ligne.ecart > 0 ? "#EAB308" : "#6F7A6B" }}>{ligne.ecart > 0 ? `+${ligne.ecart.toFixed(1)}` : ligne.ecart.toFixed(1)}</span>
                {ligne.divergence && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 999, background: "#EAB308", color: "#fff" }}>{tc.divergence}</span>}
              </div>
              <span style={{ display: "inline-block", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: REC_STYLES[ligne.recommandationIA].bg, color: REC_STYLES[ligne.recommandationIA].color }}>{recLabel(ligne.recommandationIA)}</span>
              {ligne.elimine ? (
                <span style={{ fontSize: 12, fontWeight: 600, color: "#EF4444" }}>{isAr ? ligne.motifEliminationAr : ligne.motifElimination}</span>
              ) : validated ? (
                <span style={{ display: "inline-block", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999, background: ligne.decisionFinale === "Retenir" ? "rgba(76,175,80,0.12)" : "rgba(234,179,8,0.12)", color: ligne.decisionFinale === "Retenir" ? "#2e7d32" : "#92400e" }}>
                  {ligne.decisionFinale === "Retenir" ? tc.decisions.retenir : tc.decisions.attente}
                </span>
              ) : (
                <DecisionDropdown current={ligne.decisionFinale} onChange={(d) => handleDecision(idx, d)} t={tc} />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {!isPageLoading && (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6F7A6B" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="#4CAF50" strokeWidth="2" />
            </svg>
            {tc.quorum}
            {membres && membres.length > 0 && (
              <span style={{ color: "#4CAF50", fontWeight: 600 }}>· {membres.length} membre{membres.length > 1 ? "s" : ""}</span>
            )}
          </div>
        {!validated ? (
            <button onClick={() => setShowConfirm(true)} disabled={changeStatutMutation.isPending || lignes.length === 0 || !commissionId}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: "#1E293B", color: "#fff", border: "none", cursor: (changeStatutMutation.isPending || lignes.length === 0) ? "not-allowed" : "pointer", opacity: (changeStatutMutation.isPending || lignes.length === 0) ? 0.5 : 1 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              {changeStatutMutation.isPending ? (isAr ? "جارٍ…" : "Validation…") : tc.validerBtn}
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: "rgba(76,175,80,0.1)", color: "#2e7d32" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /></svg>
              {tc.valide}
            </div>
          )}
        </div>
      )}

      <Link href={`/${locale}/dashboard/commission/evaluations/${resolvedAoId}`}
        style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ transform: isAr ? "rotate(180deg)" : "none" }}>
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {tc.retourEval}
      </Link>
    </div>
  );
}
