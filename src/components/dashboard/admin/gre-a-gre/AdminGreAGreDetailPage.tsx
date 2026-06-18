"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type AdminGreAGreDemand,
  type AdminGreAGreRecommendation,
  useAdminGreAGreDemandQuery,
  useValidateAdminGreAGreMutation,
} from "@/services/admin/gre-a-gre";

function recommendationLabel(value?: AdminGreAGreRecommendation) {
  if (!value) return "En attente";
  if (value === "ACCEPTER") return "Accepter";
  if (value === "REJETER") return "Refuser";
  return "Complements";
}

function formatScore(value: unknown) {
  const score = Number(value);
  return Number.isFinite(score) ? `${score.toFixed(0)} / 100` : "-";
}

function formatAmount(value: unknown) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return String(value ?? "-");
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDemandAo(demand?: AdminGreAGreDemand) {
  return demand?.appelOffres ?? demand?.appelOffre ?? demand?.appel_offres ?? demand?.ao;
}

export default function AdminGreAGreDetailPage({
  id,
  locale,
}: {
  id: string;
  locale: string;
}) {
  const router = useRouter();
  const [motif, setMotif] = useState("");
  const [decision, setDecision] = useState<"ACCEPTER" | "REJETER">("ACCEPTER");
  const [error, setError] = useState<string | null>(null);

  const { data: demand, isLoading, isError } = useAdminGreAGreDemandQuery(id);
  const { mutateAsync, isPending } = useValidateAdminGreAGreMutation();

  const ia = demand?.evaluationsIa?.[0];
  const humanDecision = demand?.decisions?.[0];
  const ao = getDemandAo(demand);
  const isClosed = demand?.statut === "ACCEPTEE" || demand?.statut === "REJETEE";

  const willRaiseIncident = useMemo(
    () => decision === "ACCEPTER" && ia?.recommandation === "REJETER",
    [decision, ia?.recommandation],
  );

  async function submitDecision() {
    if (!motif.trim()) {
      setError("Le motif est obligatoire.");
      return;
    }
    setError(null);
    await mutateAsync({ id, payload: { decision, motif } });
    router.refresh();
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Chargement de la demande...</div>;
  }

  if (isError || !demand) {
    return <div className="p-6 text-sm text-rose-600">Demande gre a gre introuvable.</div>;
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={`/${locale}/dashboard/admin/gre-a-gre`} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            Retour au controle GRE
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{ao?.reference ?? demand.aoId}</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">{ao?.objet ?? "Demande sans objet renseigne"}</p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-3 text-sm">
          <p className="text-xs text-slate-500">Montant estime</p>
          <p className="mt-1 font-bold text-slate-900">{formatAmount(ao?.montantEstime)}</p>
        </div>
      </div>

      {willRaiseIncident && !isClosed && (
        <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Accepter cette demande malgre une recommandation IA de refus creera automatiquement un incident IA critique.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <div className="border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Analyse IA</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Recommandation</p>
                <p className="mt-1 font-semibold text-slate-900">{recommendationLabel(ia?.recommandation)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Score conformite</p>
                <p className="mt-1 font-semibold text-slate-900">{formatScore(ia?.scoreConformite)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Confiance</p>
                <p className="mt-1 font-semibold text-slate-900">{formatScore(ia?.confianceScore)}</p>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
              {ia?.justificationIa || "Aucune justification IA disponible."}
            </p>
          </div>

          <div className="border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Pieces et justifications</h2>
            <div className="mt-4 space-y-3">
              {demand.justifications.length === 0 ? (
                <p className="text-sm text-slate-400">Aucune justification fournie.</p>
              ) : (
                demand.justifications.map((item) => (
                  <div key={item.id} className="border-l-4 border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{item.typeJustification}</p>
                      <p className="font-mono text-xs text-slate-400">{item.documentId ?? "Sans document"}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Decision controleur</h2>
            {humanDecision ? (
              <div className="mt-4 space-y-3 text-sm">
                <p><span className="text-slate-500">Decision:</span> <span className="font-semibold text-slate-900">{recommendationLabel(humanDecision.decisionFinale)}</span></p>
                <p><span className="text-slate-500">Correspond IA:</span> <span className="font-semibold text-slate-900">{humanDecision.correspondIa ? "Oui" : "Non"}</span></p>
                <p className="whitespace-pre-line leading-6 text-slate-600">{humanDecision.motifDecision}</p>
                <p className="text-xs text-slate-400">{new Date(humanDecision.dateDecision).toLocaleString(locale)}</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDecision("ACCEPTER")}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold ${decision === "ACCEPTER" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600"}`}
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => setDecision("REJETER")}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold ${decision === "REJETER" ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-600"}`}
                  >
                    Refuser
                  </button>
                </div>
                <textarea
                  value={motif}
                  onChange={(event) => setMotif(event.target.value)}
                  placeholder="Motif explicite de la decision..."
                  className="min-h-[150px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                {error && <p className="text-sm text-rose-600">{error}</p>}
                <button
                  onClick={submitDecision}
                  disabled={isPending}
                  className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Enregistrement..." : "Enregistrer la decision"}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
