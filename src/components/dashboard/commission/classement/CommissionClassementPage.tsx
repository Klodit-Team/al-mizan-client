"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Props {
  locale: string;
  aoId: string;
}

interface LigneClassement {
  rang: number | null;
  operateur: string;
  scoreCommission: number;
  scoreIA: number;
  ecart: number;
  divergence: boolean;
  recommandationIA: "Retenir" | "Analyser Plus" | "Eliminer";
  decisionFinale: "Retenir" | "En attente" | "Elimine" | null;
  motifElimination?: string;
  elimine: boolean;
}

const CLASSEMENT_MOCK: LigneClassement[] = [
  { rang: 1, operateur: "TechSolutions SPA", scoreCommission: 88.5, scoreIA: 89.0, ecart: -0.5, divergence: false, recommandationIA: "Retenir", decisionFinale: "Retenir", elimine: false },
  { rang: 2, operateur: "Global Network SA", scoreCommission: 75.0, scoreIA: 61.0, ecart: +14.0, divergence: true, recommandationIA: "Analyser Plus", decisionFinale: "En attente", elimine: false },
  { rang: null, operateur: "Micro Systemes", scoreCommission: 42.0, scoreIA: 45.0, ecart: -3.0, divergence: false, recommandationIA: "Eliminer", decisionFinale: "Elimine", motifElimination: "Éliminé (Note tech < 50)", elimine: true },
];

const STATS = [
  { label: "Soumissions Traitées", value: "12", color: "#1B1C1C" },
  { label: "Rejetées (Technique/Admin)", value: "04", color: "#EF4444" },
  { label: "Éligibles (Financière)", value: "08", color: "#4CAF50" },
];

const REC_STYLES = {
  Retenir:       { bg: "rgba(76,175,80,0.12)",  color: "#2e7d32" },
  "Analyser Plus": { bg: "rgba(234,179,8,0.12)", color: "#92400e" },
  Eliminer:      { bg: "rgba(239,68,68,0.08)",  color: "#991b1b" },
};

const DECISION_OPTIONS = [
  { label: "Retenir",    value: "Retenir"   as const, bg: "#fff",     color: "#2e7d32", border: "#4CAF50" },
  { label: "En attente", value: "En attente" as const, bg: "#FEF9C3",  color: "#92400e", border: "#EAB308" },
  { label: "Éliminer",   value: "Elimine"   as const, bg: "#FEE2E2",  color: "#991b1b", border: "#EF4444" },
];

function DecisionDropdown({ current, onChange }: {
  current: LigneClassement["decisionFinale"];
  onChange: (d: LigneClassement["decisionFinale"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const selected = DECISION_OPTIONS.find((o) => o.value === current);

  useEffect(() => {
    if (!open) return;
    const updatePos = () => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const menuH = 108; // ~3 items × 36px
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow >= menuH + 8 ? rect.bottom + 4 : rect.top - menuH - 4;
      setMenuPos({ top, left: rect.left });
    };
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    return () => window.removeEventListener("scroll", updatePos, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!btnRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 12px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 600,
          background: selected?.bg ?? "#fff",
          color: selected?.color ?? "#364150",
          border: `1px solid ${selected?.border ?? "#D1D5DB"}`,
          cursor: "pointer",
          minWidth: 110,
        }}
      >
        {selected?.label ?? "Décision"}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "auto" }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: "fixed",
            top: menuPos.top,
            left: menuPos.left,
            zIndex: 9999,
            background: "#fff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            border: "1px solid #E5E7EB",
            borderRadius: 10,
            overflow: "hidden",
            minWidth: 130,
          }}
        >
          {DECISION_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "9px 14px",
                fontSize: 13,
                color: o.color,
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 32,
          maxWidth: 420,
          width: "90%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(239,68,68,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="#EF4444" strokeWidth="2" />
            </svg>
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#364150", margin: 0 }}>
            Valider la Délibération (Irréversible)
          </h2>
        </div>
        <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6, marginBottom: 22 }}>
          Cette action est définitive et irréversible. Les décisions seront enregistrées et les soumissionnaires seront notifiés. Confirmez-vous la validation ?
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: "10px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: "#F3F4F6", color: "#6B7280", border: "none", cursor: "pointer" }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, padding: "10px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: "#364150", color: "#fff", border: "none", cursor: "pointer" }}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shared cell style ─────────────────────────────────────────────────────────
const COL_TEMPLATE = "60px minmax(120px,1fr) 140px 120px 130px 130px 140px";

export default function CommissionClassementPage({ locale, aoId }: Props) {
  const [lignes, setLignes] = useState<LigneClassement[]>(CLASSEMENT_MOCK);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleDecision = (idx: number, d: LigneClassement["decisionFinale"]) => {
    setLignes((prev) => prev.map((l, i) => (i === idx ? { ...l, decisionFinale: d } : l)));
  };

  return (
    <div style={{ minHeight: "100%" }}>
      {showConfirm && <ConfirmModal onConfirm={() => { setShowConfirm(false); setValidated(true); }} onCancel={() => setShowConfirm(false)} />}

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B1C1C", margin: 0 }}>
            Validation &amp; Classement Final
          </h1>
          <span
            style={{
              fontSize: 12,
              padding: "4px 12px",
              borderRadius: 999,
              background: "#F0EDED",
              color: "#364150",
              border: "1px solid #E5E7EB",
            }}
          >
            Commission d&apos;Évaluation
          </span>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 18px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            background: "#fff",
            color: "#364150",
            border: "1px solid #E5E7EB",
            cursor: "pointer",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Générer Rapport d&apos;Évaluation
        </button>
      </div>

      {/* ── AO title + stats ── */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1B1C1C", margin: "0 0 4px" }}>
          Classement Final : {aoId}
        </h2>
        <p style={{ fontSize: 13, color: "#6F7A6B", marginBottom: 18 }}>
          Étape 3/3 : Délibération et attribution
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 12, padding: "12px 16px" }}>
              <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ fontSize: 30, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Comparison table ── */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, marginBottom: 20, position: "relative" }}>
        {/* Table title */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #F3F4F6", borderRadius: "16px 16px 0 0" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1B1C1C", margin: "0 0 3px" }}>
            Comparaison: Commission vs IA
          </h3>
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
            Les écarts de plus de 10 points sont mis en surbrillance.
          </p>
        </div>

        {/* Column headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: COL_TEMPLATE,
            padding: "10px 24px",
            background: "#F8FAFC",
            borderBottom: "1px solid #F3F4F6",
            gap: 8,
          }}
        >
          {["RANG", "OPÉRATEUR", "SCORE GLOBAL (COMMISSION)", "SCORE GLOBAL (IA)", "ÉCART", "RECOMMANDATION IA", "DÉCISION FINALE"].map((col) => (
            <span key={col} style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {col}
            </span>
          ))}
        </div>

        {/* Data rows */}
        {lignes.map((ligne, idx) => (
          <div
            key={idx}
            style={{
              display: "grid",
              gridTemplateColumns: COL_TEMPLATE,
              padding: "16px 24px",
              alignItems: "center",
              gap: 8,
              borderBottom: idx < lignes.length - 1 ? "1px solid #F3F4F6" : "none",
              background: ligne.divergence ? "rgba(234,179,8,0.04)" : "transparent",
              opacity: ligne.elimine ? 0.6 : 1,
            }}
          >
            {/* Rang */}
            <div>
              {ligne.rang ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#fff",
                    background: ligne.rang === 1 ? "#4CAF50" : "#94A3B8",
                  }}
                >
                  {ligne.rang === 1 ? "1er" : `${ligne.rang}ème`}
                </span>
              ) : (
                <span style={{ color: "#9CA3AF", fontSize: 14 }}>—</span>
              )}
            </div>

            {/* Opérateur */}
            <span style={{ fontSize: 14, fontWeight: 600, color: ligne.elimine ? "#9CA3AF" : "#364150", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ligne.operateur}
            </span>

            {/* Score commission */}
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: ligne.elimine ? "#9CA3AF" : "#364150",
                textDecoration: ligne.elimine ? "line-through" : "none",
                whiteSpace: "nowrap",
              }}
            >
              {ligne.scoreCommission.toFixed(1)} / 100
            </span>

            {/* Score IA */}
            <span style={{ fontSize: 13, color: "#6F7A6B", whiteSpace: "nowrap" }}>
              {ligne.scoreIA.toFixed(1)} / 100
            </span>

            {/* Écart + divergence */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: ligne.ecart > 0 ? "#EAB308" : "#6F7A6B" }}>
                {ligne.ecart > 0 ? `+${ligne.ecart.toFixed(1)}` : ligne.ecart.toFixed(1)}
              </span>
              {ligne.divergence && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 999,
                    background: "#EAB308",
                    color: "#fff",
                    letterSpacing: "0.02em",
                  }}
                >
                  DIVERGENCE
                </span>
              )}
            </div>

            {/* Recommandation IA */}
            <span
              style={{
                display: "inline-block",
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 999,
                background: REC_STYLES[ligne.recommandationIA].bg,
                color: REC_STYLES[ligne.recommandationIA].color,
              }}
            >
              {ligne.recommandationIA}
            </span>

            {/* Décision finale */}
            {ligne.elimine ? (
              <span style={{ fontSize: 12, fontWeight: 600, color: "#EF4444" }}>
                {ligne.motifElimination}
              </span>
            ) : validated ? (
              <span
                style={{
                  display: "inline-block",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "4px 12px",
                  borderRadius: 999,
                  background: ligne.decisionFinale === "Retenir" ? "rgba(76,175,80,0.12)" : "rgba(234,179,8,0.12)",
                  color: ligne.decisionFinale === "Retenir" ? "#2e7d32" : "#92400e",
                }}
              >
                {ligne.decisionFinale}
              </span>
            ) : (
              <DecisionDropdown
                current={ligne.decisionFinale}
                onChange={(d) => handleDecision(idx, d)}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Footer validation bar ── */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 14,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6F7A6B" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" stroke="#4CAF50" strokeWidth="2" />
          </svg>
          Toutes les notes ont été saisies par le quorum (5/5 membres).
        </div>

        {!validated ? (
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 22px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              background: "#1E293B",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Valider la Délibération (Irréversible)
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 22px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              background: "rgba(76,175,80,0.1)",
              color: "#2e7d32",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            </svg>
            Délibération validée avec succès
          </div>
        )}
      </div>

      {/* Back link */}
      <Link
        href={`/${locale}/dashboard/commission/evaluations/${aoId}`}
        style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Retour à l&apos;évaluation
      </Link>
    </div>
  );
}