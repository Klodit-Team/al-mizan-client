"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Locale } from "@/i18n/config";
import {
  useOperateurRecoursDetailQuery,
  useUpdateOperateurRecoursMutation,
} from "@/services/operateur-recours/queries";
import {
  ArrowLeft, Download, FileText, Calendar, Clock, CheckCircle2,
  XCircle, Scale, Building2, DollarSign,
} from "lucide-react";
import { STATUS_META, fmt } from "./types";

// ─── Timeline step ─────────────────────────────────────────────────────────────

function TimelineStep({
  icon, label, date, sublabel, active, last,
}: {
  icon: React.ReactNode;
  label: string;
  date?: string;
  sublabel?: string;
  active: boolean;
  last?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          active
            ? "border-[#4CAF50] bg-emerald-50 text-[#4CAF50]"
            : "border-slate-200 bg-white text-slate-300"
        }`}>
          {icon}
        </div>
        {!last && (
          <div
            className={`mt-1 w-0.5 flex-1 ${active ? "bg-[#4CAF50]/30" : "bg-slate-100"}`}
            style={{ minHeight: "2rem" }}
          />
        )}
      </div>
      <div className="pb-5">
        <p className={`text-xs font-semibold ${active ? "text-slate-800" : "text-slate-400"}`}>{label}</p>
        {sublabel && (
          <p className={`text-[10px] ${active ? "text-slate-500" : "text-slate-300"}`}>{sublabel}</p>
        )}
        {date
          ? <p className={`mt-0.5 text-[11px] ${active ? "text-slate-500" : "text-slate-300"}`}>{fmt(date)}</p>
          : <p className="mt-0.5 text-[11px] text-slate-300">En attente</p>
        }
      </div>
    </div>
  );
}

// ─── Info row ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 border-b border-slate-100 py-2.5 last:border-0 sm:grid-cols-[160px_1fr] sm:gap-3">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="text-xs text-slate-700">{value}</dd>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function RecoursDetailPage({ recoursId }: { recoursId: string }) {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) || "fr";
  const { data: recours, isLoading, isError } = useOperateurRecoursDetailQuery(recoursId);
  const updateMutation = useUpdateOperateurRecoursMutation();

  const [isEditingMotif, setIsEditingMotif] = useState(false);
  const [motifDraft, setMotifDraft] = useState("");

  const canEditMotif = recours?.statut === "depose";

  useEffect(() => {
    if (recours?.motif) {
      setMotifDraft(recours.motif);
    }
  }, [recours?.motif]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-14 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-56 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (isError || !recours) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Scale className="mb-3 h-12 w-12 opacity-20" />
        <p className="text-base font-medium text-slate-500">Recours introuvable</p>
        <button type="button" onClick={() => router.back()}
          className="mt-4 text-sm font-semibold hover:underline" style={{ color: "#4CAF50" }}>
          ← Retour à mes recours
        </button>
      </div>
    );
  }

  const meta      = STATUS_META[recours.statut];
  const isDecided = recours.statut === "accepte" || recours.statut === "rejete";

  async function handleSaveMotif() {
    const trimmed = motifDraft.trim();
    if (!trimmed || !recours) {
      return;
    }

    await updateMutation.mutateAsync({
      id: recours.id,
      motif: trimmed,
    });
    setIsEditingMotif(false);
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/dashboard/operateur/recours`)}
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-base font-bold text-slate-900">{recours.reference}</h1>
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${meta.bg} ${meta.text} ${meta.border}`}>
                {meta.label}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[11px] font-semibold" style={{ color: "#4CAF50" }}>{recours.aoReference}</p>
            <p className="text-xs text-slate-600">{recours.aoObject}</p>
            <p className="mt-1 text-[11px] text-slate-400">Déposé le {fmt(recours.dateDepot)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">

          {/* Recours info */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Informations du recours</h2>
            <dl>
              <InfoRow label="Référence recours" value={
                <span className="font-mono text-[11px] font-bold text-slate-700">{recours.reference}</span>
              } />
              <InfoRow label="AO concerné" value={
                <span className="font-mono text-[11px] font-semibold" style={{ color: "#4CAF50" }}>{recours.aoReference}</span>
              } />
              <InfoRow label="Objet" value={recours.aoObject} />
              <InfoRow label="Attributaire" value={
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3 w-3 text-slate-400" />
                  {recours.attribution.winner}
                </span>
              } />
              <InfoRow label="Montant attribué" value={
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-3 w-3 text-slate-400" />
                  <span className="font-semibold text-slate-700">{recours.attribution.montantAttribue}</span>
                </span>
              } />
            </dl>
          </section>

          {/* Motif */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Motif du recours</h2>
              {canEditMotif && !isEditingMotif && (
                <button
                  type="button"
                  onClick={() => setIsEditingMotif(true)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:border-[#4CAF50] hover:text-[#4CAF50]"
                >
                  Modifier
                </button>
              )}
            </div>

            {isEditingMotif ? (
              <div className="space-y-2">
                <textarea
                  value={motifDraft}
                  onChange={(event) => setMotifDraft(event.target.value)}
                  rows={7}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#4CAF50] focus:bg-white transition-colors"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMotifDraft(recours.motif);
                      setIsEditingMotif(false);
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMotif}
                    disabled={updateMutation.isPending || motifDraft.trim().length < 10}
                    className="rounded-lg bg-[#4CAF50] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">{recours.motif}</p>
            )}
          </section>

          {/* Pièces jointes */}
          {recours.piecesJointes.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                Pièces jointes ({recours.piecesJointes.length})
              </h2>
              <ul className="space-y-2">
                {recours.piecesJointes.map((pj) => (
                  <li key={pj.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 hover:bg-slate-100 transition-colors">
                    <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-700">{pj.nom}</p>
                      <p className="text-[10px] text-slate-400">{pj.taille}</p>
                    </div>
                    <button type="button" title="Télécharger"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#4CAF50] hover:text-[#4CAF50] transition-colors">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Decision section */}
          {isDecided && recours.decision && (
            <section className={`rounded-xl border p-5 shadow-sm ${
              recours.decision.statut === "accepte"
                ? "border-emerald-200 bg-emerald-50"
                : "border-rose-200 bg-rose-50"
            }`}>
              <div className="mb-3 flex items-center gap-2.5">
                {recours.decision.statut === "accepte"
                  ? <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
                  : <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100"><XCircle className="h-5 w-5 text-rose-500" /></div>
                }
                <div>
                  <h2 className={`text-sm font-bold ${
                    recours.decision.statut === "accepte" ? "text-emerald-800" : "text-rose-800"
                  }`}>
                    Décision : {recours.decision.statut === "accepte" ? "Recours Accepté" : "Recours Rejeté"}
                  </h2>
                  <p className={`text-[10px] ${
                    recours.decision.statut === "accepte" ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    Rendue le {fmt(recours.decision.date)}
                  </p>
                </div>
              </div>
              <p className={`text-xs leading-relaxed ${
                recours.decision.statut === "accepte" ? "text-emerald-700" : "text-rose-700"
              }`}>
                {recours.decision.motif}
              </p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Timeline */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Chronologie</h2>
            <TimelineStep
              icon={<Scale className="h-3.5 w-3.5" />}
              label="Recours déposé"
              date={recours.dateDepot}
              active={true}
            />
            <TimelineStep
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Date limite de réponse"
              date={recours.dateLimiteReponse}
              active={["en_examen", "accepte", "rejete"].includes(recours.statut)}
            />
            <TimelineStep
              icon={isDecided
                ? recours.decision?.statut === "accepte"
                  ? <CheckCircle2 className="h-3.5 w-3.5" />
                  : <XCircle className="h-3.5 w-3.5" />
                : <Calendar className="h-3.5 w-3.5" />
              }
              label="Date de décision"
              date={recours.dateDecision}
              active={isDecided}
              last
            />
          </section>

          {/* Attribution context */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Attribution provisoire</h2>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Attributaire</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-700">{recours.attribution.winner}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Montant attribué</p>
                <p className="mt-0.5 text-xs font-bold text-slate-800">{recours.attribution.montantAttribue}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Date attribution</p>
                <p className="mt-0.5 text-xs text-slate-600">{fmt(recours.attribution.dateAttribution)}</p>
              </div>
            </div>
          </section>

          {/* Statut badge */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Statut actuel</p>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${meta.bg} ${meta.text} ${meta.border}`}>
              {meta.label}
            </span>
          </section>
        </div>
      </div>
    </div>
  );
}