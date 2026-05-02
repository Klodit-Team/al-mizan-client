"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  locale: string;
  aoId: string;
}

interface Critere {
  id: string;
  label: string;
  ponderation: number;
  noteMax: number;
  noteEliminatoire?: number;
  description: string;
  note: number | null;
  justification: string;
  ia: {
    noteSuggeree: number;
    justification: string;
    confiance: number;
    alerte?: string;
  };
}

const SOUMISSIONS_MOCK = [
  { id: "s1", reference: "S-2023-004", lot: "Lot 1" },
  { id: "s2", reference: "S-2023-005", lot: "Lot 1" },
  { id: "s3", reference: "S-2023-006", lot: "Lot 1" },
  { id: "s4", reference: "S-2023-007", lot: "Lot 1" },
  { id: "s5", reference: "S-2023-008", lot: "Lot 1" },
];

const CRITERES_INIT: Critere[] = [
  {
    id: "c1",
    label: "Capacité Technique & Expérience",
    ponderation: 40,
    noteMax: 100,
    description: "Évaluation de l'expérience pertinente et des capacités techniques démontrées.",
    note: null,
    justification: "",
    ia: {
      noteSuggeree: 85,
      justification: "Le candidat a fourni 3 attestations de bonne exécution valides pour des projets similaires > 50M DZD.",
      confiance: 92,
    },
  },
  {
    id: "c2",
    label: "Méthodologie & Planning",
    ponderation: 30,
    noteMax: 100,
    noteEliminatoire: 15,
    description: "Analyse de la cohérence de la méthodologie et du réalisme du planning.",
    note: null,
    justification: "",
    ia: {
      noteSuggeree: 60,
      justification: "Le planning proposé (6 mois) est inférieur au minimum requis dans le CDC (8 mois).",
      confiance: 78,
      alerte: "Le planning proposé (6 mois) est inférieur au minimum requis dans le CDC (8 mois).",
    },
  },
  {
    id: "c3",
    label: "Ressources Humaines",
    ponderation: 20,
    noteMax: 100,
    description: "Évaluation des CV et qualifications du personnel clé proposé.",
    note: null,
    justification: "",
    ia: {
      noteSuggeree: 72,
      justification: "L'équipe proposée couvre les profils requis mais manque d'un expert senior en cybersécurité.",
      confiance: 85,
    },
  },
  {
    id: "c4",
    label: "Moyens Matériels",
    ponderation: 10,
    noteMax: 100,
    description: "Adéquation des équipements et matériels techniques proposés.",
    note: null,
    justification: "",
    ia: {
      noteSuggeree: 90,
      justification: "Les équipements listés correspondent aux spécifications techniques du CDC.",
      confiance: 95,
    },
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function IaAccordion({ critere, expanded, onToggle }: {
  critere: Critere;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(234,179,8,0.35)",
        background: "rgba(255,251,235,0.6)",
        borderRadius: 12,
        marginTop: 12,
        overflow: "hidden",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>
            Suggestion IA - Note: {critere.ia.noteSuggeree}/100
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 999,
              background: "rgba(234,179,8,0.15)",
              color: "#92400e",
            }}
          >
            Confiance: {critere.ia.confiance}%
          </span>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
        >
          <path d="M6 9l6 6 6-6" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <div style={{ padding: "0 16px 14px", borderTop: "1px solid rgba(234,179,8,0.2)" }}>
          <p style={{ fontSize: 12, color: "#78350f", marginTop: 10, marginBottom: 8, lineHeight: 1.55 }}>
            {critere.ia.justification}
          </p>
          {critere.ia.alerte && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
                padding: "8px 10px",
                borderRadius: 8,
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#991b1b",
                fontSize: 12,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>
              Alerte IA : {critere.ia.alerte}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CritereCard({ critere, onNoteChange, onJustifChange }: {
  critere: Critere;
  onNoteChange: (id: string, val: number | null) => void;
  onJustifChange: (id: string, val: string) => void;
}) {
  const [iaExpanded, setIaExpanded] = useState(false);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        padding: "20px 24px",
        marginBottom: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1B1C1C", margin: 0 }}>
          {critere.label}
        </h3>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 999,
            background: "rgba(76,175,80,0.1)",
            color: "#2e7d32",
            whiteSpace: "nowrap",
            marginLeft: 12,
            flexShrink: 0,
          }}
        >
          Pondération: {critere.ponderation}%
        </span>
      </div>

      <p style={{ fontSize: 13, color: "#6F7A6B", marginBottom: 12, lineHeight: 1.5 }}>
        {critere.description}
      </p>

      {critere.noteEliminatoire && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: 12,
            padding: "3px 10px",
            borderRadius: 999,
            background: "rgba(239,68,68,0.07)",
            color: "#dc2626",
            border: "1px solid rgba(239,68,68,0.2)",
            marginBottom: 14,
          }}
        >
          Note éliminatoire &lt; {critere.noteEliminatoire}/{critere.noteMax}
        </div>
      )}

      {/* Note input */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: "#364150" }}>
          Note attribuée (0-100):
        </label>
        <input
          type="number"
          min={0}
          max={critere.noteMax}
          value={critere.note ?? ""}
          onChange={(e) => {
            const val = e.target.value === "" ? null : Math.min(critere.noteMax, Math.max(0, parseFloat(e.target.value)));
            onNoteChange(critere.id, val);
          }}
          placeholder="—"
          style={{
            width: 70,
            textAlign: "center",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            outline: "none",
            background: "#F5F7FA",
            border: "1px solid #D1D5DB",
            color: "#364150",
            padding: "7px 8px",
          }}
        />
      </div>

      {/* Justification */}
      <label style={{ fontSize: 13, fontWeight: 500, color: "#364150", display: "block", marginBottom: 6 }}>
        Justification:
      </label>
      <textarea
        rows={3}
        value={critere.justification}
        onChange={(e) => onJustifChange(critere.id, e.target.value)}
        placeholder="Expliquez votre note…"
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 10,
          fontSize: 13,
          outline: "none",
          resize: "none",
          background: "#F5F7FA",
          border: "1px solid #D1D5DB",
          color: "#364150",
          boxSizing: "border-box",
          lineHeight: 1.5,
        }}
      />

      <IaAccordion critere={critere} expanded={iaExpanded} onToggle={() => setIaExpanded(!iaExpanded)} />
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function CommissionEvaluationPage({ locale, aoId }: Props) {
  const [activeSoumissionIdx, setActiveSoumissionIdx] = useState(0);
  const [criteresByS, setCriteresByS] = useState<Record<string, Critere[]>>(
    Object.fromEntries(SOUMISSIONS_MOCK.map((s) => [s.id, CRITERES_INIT.map((c) => ({ ...c }))]))
  );
  const [saved, setSaved] = useState(false);

  const currentSoumission = SOUMISSIONS_MOCK[activeSoumissionIdx];
  const criteres = criteresByS[currentSoumission.id] ?? [];

  const scoreActuel = criteres.reduce((acc, c) => {
    if (c.note === null) return acc;
    return acc + (c.note * c.ponderation) / 100;
  }, 0);

  const handleNote = (id: string, val: number | null) => {
    setCriteresByS((prev) => ({
      ...prev,
      [currentSoumission.id]: prev[currentSoumission.id].map((c) =>
        c.id === id ? { ...c, note: val } : c
      ),
    }));
    setSaved(false);
  };

  const handleJustif = (id: string, val: string) => {
    setCriteresByS((prev) => ({
      ...prev,
      [currentSoumission.id]: prev[currentSoumission.id].map((c) =>
        c.id === id ? { ...c, justification: val } : c
      ),
    }));
    setSaved(false);
  };

  const goNext = () => {
    setSaved(true);
    if (activeSoumissionIdx < SOUMISSIONS_MOCK.length - 1) {
      setActiveSoumissionIdx((i) => i + 1);
      setSaved(false);
    }
  };

  const goPrev = () => {
    if (activeSoumissionIdx > 0) {
      setActiveSoumissionIdx((i) => i - 1);
      setSaved(false);
    }
  };

  return (
    <div style={{ minHeight: "100%" }}>

      {/* ── Navbar-level header bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B1C1C", margin: 0 }}>
            Notation Technique
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
        <Link
          href={`/${locale}/dashboard/commission/classement/${aoId}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            background: "#1E293B",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Voir classement
        </Link>
      </div>

      {/* ── Soumission info bar ── */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 14,
          padding: "14px 20px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#1B1C1C", margin: 0 }}>
            Soumission: {currentSoumission.reference}{" "}
            <span style={{ fontWeight: 400, fontSize: 13, color: "#6F7A6B" }}>(Anonymisée)</span>
          </p>
          <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
            {currentSoumission.lot} · {activeSoumissionIdx + 1}/{SOUMISSIONS_MOCK.length}
          </p>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#4CAF50" }}>
          Score actuel: {scoreActuel.toFixed(0)} / 100
        </span>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* Left: criteria list */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {criteres.map((c) => (
            <CritereCard
              key={c.id}
              critere={c}
              onNoteChange={handleNote}
              onJustifChange={handleJustif}
            />
          ))}

          {/* Navigation footer */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 14,
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <button
              onClick={goPrev}
              disabled={activeSoumissionIdx === 0}
              style={{
                padding: "9px 20px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                background: "#F5F7FA",
                color: "#6B7280",
                border: "1px solid #D1D5DB",
                cursor: activeSoumissionIdx === 0 ? "not-allowed" : "pointer",
                opacity: activeSoumissionIdx === 0 ? 0.45 : 1,
              }}
            >
              Soumission Précédente
            </button>
            <button
              onClick={goNext}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 28px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                background: "#4CAF50",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              {saved && activeSoumissionIdx === SOUMISSIONS_MOCK.length - 1 ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  Enregistré
                </>
              ) : (
                "Enregistrer et Suivant"
              )}
            </button>
          </div>
        </div>

        {/* Right: IA assistant sticky panel */}
        <div style={{ width: 270, flexShrink: 0 }}>
          <div
            style={{
              background: "#1E293B",
              borderRadius: 16,
              overflow: "hidden",
              position: "sticky",
              top: 16,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>✨</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                  Assistant IA Al-Mizan
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#94A3B8", margin: 0, lineHeight: 1.4 }}>
                Analyse basée sur les documents techniques soumis.
              </p>
            </div>

            {/* Criteria cards */}
            <div style={{ padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {criteres.map((c, idx) => (
                <div
                  key={c.id}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: c.ia.alerte
                      ? "1px solid rgba(234,179,8,0.4)"
                      : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: c.ia.alerte ? "#EAB308" : "#64748B",
                      marginBottom: 6,
                    }}
                  >
                    Critère {idx + 1} · {c.label.split(" ").slice(0, 2).join(" ")}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: c.ia.alerte ? "#EAB308" : "#4CAF50",
                      marginBottom: 6,
                    }}
                  >
                    Note suggérée : {c.ia.noteSuggeree}/100
                  </p>
                  <p style={{ fontSize: 11, color: "#CBD5E1", marginBottom: 6, lineHeight: 1.45 }}>
                    {c.ia.justification}
                  </p>
                  <p style={{ fontSize: 11, color: "#475569" }}>
                    Confiance : {c.ia.confiance}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}