"use client";

import Link from "next/link";
import { commissionTranslations } from "@/i18n/commission-translations";
import { useMesCommissionsQuery } from "@/services/commission-dashboard/queries";

interface Props {
  locale: string;
}

type StatutPhase = "terminee" | "en_cours" | "verrouillee";

function PhaseIcon({ statut }: { statut: StatutPhase }) {
  if (statut === "terminee")
    return (
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(76,175,80,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="9" stroke="#4CAF50" strokeWidth="2" />
        </svg>
      </div>
    );
  if (statut === "en_cours")
    return (
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(76,175,80,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M7 17V13H11V17H7ZM13 17V7H17V17H13Z" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  return (
    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#F0EDED", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="#BECAB9" strokeWidth="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" stroke="#BECAB9" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// État vide propre
function EmptyState({ isAr }: { isAr: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", gap: 16 }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: "#F8FAFC", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#6B7280", margin: "0 0 4px" }}>
          {isAr ? "لا توجد تقييمات" : "Aucune évaluation"}
        </p>
        <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>
          {isAr ? "لم يتم تعيين أي لجنة تقييم لك بعد" : "Aucune commission d'évaluation ne vous a été assignée"}
        </p>
      </div>
    </div>
  );
}

export default function CommissionEvaluationsPage({ locale }: Props) {
  const isAr = locale === "ar";
  const t = commissionTranslations[isAr ? "ar" : "fr"];
  const td = t.dashboard;

  const { data, isLoading } = useMesCommissionsQuery();

  const commissions = data?.commissionsEvaluation ?? [];
  const seances = data?.seancesOuverture ?? [];
  const activeCommission = commissions.find((c) => c.statut === "ACTIVE") ?? commissions[0];
  const activeAoId = activeCommission
    ? seances.find((s) => s.commissionId === activeCommission.id)?.appelOffreId ?? activeCommission.id
    : "";

  // Loading skeleton
  if (isLoading) {
    return (
      <div style={{ minHeight: "100%", direction: isAr ? "rtl" : "ltr", padding: "20px 0" }}>
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, height: 72, marginBottom: 20 }} className="animate-pulse" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 16, height: 220 }} className="animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // État vide
  if (!activeCommission) {
    return (
      <div style={{ minHeight: "100%", direction: isAr ? "rtl" : "ltr" }}>
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, overflow: "hidden" }}>
          <EmptyState isAr={isAr} />
        </div>
      </div>
    );
  }

  const AO_ID = activeAoId;
  const AO_REF = activeCommission.reference;
  const AO_OBJET = activeCommission.objet;

  const progressGlobal = (() => {
    switch (activeCommission.statut) {
      case "ACTIVE": return 60;
      case "CLOTUREE": return 100;
      case "ANNULEE": return 0;
      default: return 33;
    }
  })();

  type PhaseData = {
    statut: StatutPhase;
    progress: number;
    detailArgs: [number, number];
    actionKey: "voirResultats" | "continuer" | "nonAccessible";
    actionHref?: string;
  };

  const PHASES_DATA: PhaseData[] = (() => {
    switch (activeCommission.statut) {
      case "CLOTUREE":
        return [
          { statut: "terminee", progress: 100, detailArgs: [5, 5], actionKey: "voirResultats", actionHref: `/${locale}/dashboard/commission/evaluations/${AO_ID}` },
          { statut: "terminee", progress: 100, detailArgs: [5, 5], actionKey: "voirResultats", actionHref: `/${locale}/dashboard/commission/evaluations/${AO_ID}` },
          { statut: "terminee", progress: 100, detailArgs: [5, 5], actionKey: "voirResultats", actionHref: `/${locale}/dashboard/commission/classement/${AO_ID}` },
        ];
      case "ACTIVE":
        return [
          { statut: "terminee", progress: 100, detailArgs: [5, 5], actionKey: "voirResultats", actionHref: `/${locale}/dashboard/commission/evaluations/${AO_ID}` },
          { statut: "en_cours", progress: 60, detailArgs: [3, 5], actionKey: "continuer" },
          { statut: "verrouillee", progress: 0, detailArgs: [0, 0], actionKey: "nonAccessible" },
        ];
      default:
        return [
          { statut: "en_cours", progress: 20, detailArgs: [1, 5], actionKey: "continuer" },
          { statut: "verrouillee", progress: 0, detailArgs: [0, 0], actionKey: "nonAccessible" },
          { statut: "verrouillee", progress: 0, detailArgs: [0, 0], actionKey: "nonAccessible" },
        ];
    }
  })();

  return (
    <div style={{ minHeight: "100%", direction: isAr ? "rtl" : "ltr" }}>
      {/* AO Header */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "18px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B1C1C", margin: "0 0 4px" }}>{td.titre(AO_REF)}</h1>
          <p style={{ fontSize: 13, color: "#6F7A6B", margin: 0 }}>{AO_OBJET} · {td.phase}</p>
        </div>
        <Link href={`/${locale}/dashboard/commission/classement/${AO_ID}`}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: "rgba(76,175,80,0.1)", color: "#2e7d32", border: "1px solid rgba(76,175,80,0.2)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M7 17V13H11V17H7ZM13 17V7H17V17H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {td.globalProgress(progressGlobal)}
        </Link>
      </div>

      {/* Phases grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {PHASES_DATA.map((phaseData, idx) => {
          const phaseInfo = td.phases[idx];
          const { statut, progress, detailArgs } = phaseData;
          const isVerrouillee = statut === "verrouillee";
          const isEnCours = statut === "en_cours";
          const href = phaseData.actionHref ?? `/${locale}/dashboard/commission/evaluations/${AO_ID}`;
          const detail = isVerrouillee ? td.detail.verrouillee : isEnCours ? td.detail.en_cours(...detailArgs) : td.detail.terminee(...detailArgs);

          return (
            <div key={idx} style={{ background: "#fff", border: `1px solid ${isEnCours ? "#4CAF50" : "#E5E7EB"}`, borderTopWidth: isEnCours ? 3 : 1, borderRadius: 16, display: "flex", flexDirection: "column", opacity: isVerrouillee ? 0.75 : 1, overflow: "hidden" }}>
              <div style={{ padding: "20px 22px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <PhaseIcon statut={statut} />
                <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999, background: isEnCours ? "#4CAF50" : "#F0EDED", color: isEnCours ? "#fff" : "#364150" }}>
                  {td.statuts[statut]}
                </span>
              </div>
              <div style={{ padding: "0 22px 14px", flex: 1 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1B1C1C", margin: "0 0 4px" }}>{phaseInfo.numero}. {phaseInfo.label}</h3>
                <p style={{ fontSize: 13, color: isVerrouillee ? "#BECAB9" : "#6F7A6B", margin: 0, fontStyle: isVerrouillee ? "italic" : "normal" }}>
                  {detail}
                  {isEnCours && <span style={{ marginInlineStart: 8, fontWeight: 700, color: "#4CAF50" }}>{progress}%</span>}
                </p>
              </div>
              <div style={{ padding: "0 22px 18px" }}>
                <div style={{ height: 6, borderRadius: 999, background: "#F0EDED" }}>
                  <div style={{ height: 6, borderRadius: 999, width: `${progress}%`, background: statut === "terminee" ? "#4CAF50" : isEnCours ? "linear-gradient(90deg,#4CAF50,#81C784)" : "transparent", transition: "width 0.7s" }} />
                </div>
              </div>
              <div style={{ padding: "0 22px 22px" }}>
                {isVerrouillee ? (
                  <div style={{ padding: "11px", borderRadius: 12, background: "#F0EDED", color: "#9CA3AF", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
                    {td.actions.nonAccessible}
                  </div>
                ) : isEnCours ? (
                  <Link href={href} style={{ display: "block", padding: "11px", borderRadius: 12, background: "#4CAF50", color: "#fff", fontSize: 13, fontWeight: 600, textAlign: "center", textDecoration: "none" }}>
                    {td.actions.continuer}
                  </Link>
                ) : (
                  <Link href={href} style={{ display: "block", padding: "11px", borderRadius: 12, background: "#fff", color: "#364150", border: "1px solid #E5E7EB", fontSize: 13, fontWeight: 600, textAlign: "center", textDecoration: "none" }}>
                    {td.actions.voirResultats}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
