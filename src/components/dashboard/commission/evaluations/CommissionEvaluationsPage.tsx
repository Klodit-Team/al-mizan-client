"use client";

import Link from "next/link";

interface Props {
  locale: string;
}

const AO_MOCK = {
  id: "AO-2023-089",
  reference: "AO-2023-089",
  objet: "Acquisition Matériel IT",
  phase: "Phase d'évaluation",
  progressGlobal: 33,
};

interface Phase {
  numero: number;
  label: string;
  statut: "terminee" | "en_cours" | "verrouillee";
  detail: string;
  progress: number;
  actionLabel: string;
  actionHref?: string;
}

const PHASES: Phase[] = [
  {
    numero: 1,
    label: "Éligibilité",
    statut: "terminee",
    detail: "5/5 dossiers vérifiés",
    progress: 100,
    actionLabel: "Voir les résultats",
    actionHref: "#",
  },
  {
    numero: 2,
    label: "Évaluation Technique",
    statut: "en_cours",
    detail: "3/5 soumissions notées",
    progress: 60,
    actionLabel: "Continuer la notation",
  },
  {
    numero: 3,
    label: "Évaluation Financière",
    statut: "verrouillee",
    detail: "En attente de la validation technique…",
    progress: 0,
    actionLabel: "Non accessible",
  },
];

function PhaseIcon({ statut }: { statut: Phase["statut"] }) {
  if (statut === "terminee")
    return (
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(76,175,80,0.12)" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="9" stroke="#4CAF50" strokeWidth="2" />
        </svg>
      </div>
    );
  if (statut === "en_cours")
    return (
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(76,175,80,0.12)" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M7 17V13H11V17H7ZM13 17V7H17V17H13Z" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  return (
    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#F0EDED" }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="#BECAB9" strokeWidth="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" stroke="#BECAB9" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function StatutBadge({ statut }: { statut: Phase["statut"] }) {
  if (statut === "terminee")
    return (
      <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#F0EDED", color: "#364150" }}>
        Terminée
      </span>
    );
  if (statut === "en_cours")
    return (
      <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#4CAF50", color: "#fff" }}>
        En cours
      </span>
    );
  return (
    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#F0EDED", color: "#9CA3AF" }}>
      Verrouillée
    </span>
  );
}

function PhaseCard({ phase, locale }: { phase: Phase; locale: string }) {
  const isVerrouillee = phase.statut === "verrouillee";
  const isEnCours = phase.statut === "en_cours";
  const href = phase.actionHref ?? `/${locale}/dashboard/commission/evaluations/${AO_MOCK.id}`;

  return (
    <div
      className="flex flex-col rounded-2xl bg-white overflow-hidden"
      style={{
        border: "1px solid #E5E7EB",
        borderTopWidth: isEnCours ? 3 : 1,
        borderTopColor: isEnCours ? "#4CAF50" : "#E5E7EB",
        opacity: isVerrouillee ? 0.75 : 1,
      }}
    >
      <div className="px-6 pt-6 pb-4 flex items-start justify-between">
        <PhaseIcon statut={phase.statut} />
        <StatutBadge statut={phase.statut} />
      </div>

      <div className="px-6 pb-4 flex-1">
        <h3 className="text-base font-bold mb-1" style={{ color: "#1B1C1C" }}>
          {phase.numero}. {phase.label}
        </h3>
        <p
          className="text-sm"
          style={{
            color: isVerrouillee ? "#BECAB9" : "#6F7A6B",
            fontStyle: isVerrouillee ? "italic" : "normal",
          }}
        >
          {phase.detail}
          {isEnCours && (
            <span className="ml-2 font-bold" style={{ color: "#4CAF50" }}>
              {phase.progress}%
            </span>
          )}
        </p>
      </div>

      <div className="px-6 mb-5">
        <div className="w-full h-1.5 rounded-full" style={{ background: "#F0EDED" }}>
          <div
            className="h-1.5 rounded-full transition-all duration-700"
            style={{
              width: `${phase.progress}%`,
              background:
                phase.statut === "terminee"
                  ? "#4CAF50"
                  : isEnCours
                  ? "linear-gradient(90deg, #4CAF50, #81C784)"
                  : "transparent",
            }}
          />
        </div>
      </div>

      <div className="px-6 pb-6">
        {isVerrouillee ? (
          <div
            className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-semibold"
            style={{ background: "#F0EDED", color: "#9CA3AF" }}
          >
            Non accessible
          </div>
        ) : isEnCours ? (
          <Link
            href={href}
            className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "#4CAF50", color: "#fff" }}
          >
            {phase.actionLabel}
          </Link>
        ) : (
          <Link
            href={href}
            className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-semibold transition-all hover:bg-gray-50"
            style={{ background: "#fff", color: "#364150", border: "1px solid #E5E7EB" }}
          >
            {phase.actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function CommissionEvaluationsPage({ locale }: Props) {
  return (
    <div className="min-h-full">
      {/* AO Header */}
      <div
        className="rounded-2xl px-6 py-5 mb-6 flex items-center justify-between"
        style={{ background: "#fff", border: "1px solid #E5E7EB" }}
      >
        <div>
          <h1 className="text-xl font-bold mb-0.5" style={{ color: "#1B1C1C" }}>
            Évaluation : {AO_MOCK.reference}
          </h1>
          <p className="text-sm" style={{ color: "#6F7A6B" }}>
            {AO_MOCK.objet} · {AO_MOCK.phase}
          </p>
        </div>
        <Link
          href={`/${locale}/dashboard/commission/classement/${AO_MOCK.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90"
          style={{
            background: "rgba(76,175,80,0.1)",
            color: "#2e7d32",
            border: "1px solid rgba(76,175,80,0.2)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M7 17V13H11V17H7ZM13 17V7H17V17H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Global Progress: {AO_MOCK.progressGlobal}%
        </Link>
      </div>

      {/* Phases grid */}
      <div className="grid grid-cols-3 gap-5">
        {PHASES.map((phase) => (
          <PhaseCard key={phase.numero} phase={phase} locale={locale} />
        ))}
      </div>
    </div>
  );
}