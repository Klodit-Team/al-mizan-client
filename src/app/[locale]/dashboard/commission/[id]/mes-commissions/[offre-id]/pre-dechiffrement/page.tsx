import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";
import {
  getCommissionEvaluation,
  listMembresEvaluation,
  listSeancesOuverture,
  listResultats,
} from "@/services/commission-dashboard/api";
import { getCommissionAoSubmissions } from "@/services/commission/api";
import PreDechiffrementForm from "@/components/dashboard/commission/ouverture/PreDechiffrementForm";

interface PageProps {
  params: Promise<{ locale: Locale; id: string; "offre-id": string }>;
}

function EmptyState({ locale, title, subtitle }: { locale: Locale; title: string; subtitle: string }) {
  const isAr = locale === "ar";
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      <p className="mt-4 text-xs text-slate-400">
        {isAr ? "البيانات تأتي مباشرة من الخادم." : "Les données proviennent directement du backend."}
      </p>
    </div>
  );
}

export default async function PreDechiffrementPage({ params }: PageProps) {
  const { locale, id, "offre-id": offreId } = await params;
  const dict = await getDictionary(locale);
  const pageDict = dict.dashboard.commission.preDechiffrementPage;
  const isAr = locale === "ar";

  const [commission, membres, seances, submissions] = await Promise.all([
    getCommissionEvaluation(id).catch(() => null),
    listMembresEvaluation(id).catch(() => []),
    listSeancesOuverture(id).catch(() => []),
    getCommissionAoSubmissions(offreId).catch(() => []),
  ]);

  const seanceActive = seances.find((seance) => seance.appelOffreId === offreId) ?? seances[0] ?? null;
  const resultats = seanceActive
    ? await listResultats(seanceActive.id).catch(() => [])
    : [];

  const activeMembers = membres.filter((membre) => membre.actif);
  const resultatBySubmission = new Map(resultats.map((resultat) => [resultat.soumissionId, resultat]));

  const rows = submissions.map((submission) => {
    const resultat = resultatBySubmission.get(submission.id);
    return {
      ...submission,
      received: true,
      compliant: resultat?.estConforme ?? false,
      observations: resultat?.observations ?? "—",
    };
  });

  if (!commission) {
    return (
      <EmptyState
        locale={locale}
        title={isAr ? "اللجنة غير متاحة" : "Commission introuvable"}
        subtitle={isAr ? "تعذر charger la commission à partir du backend." : "Impossible de charger la commission depuis le backend."}
      />
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PreDechiffrementForm
        locale={locale}
        commissionId={id}
        offreId={offreId}
        commission={commission}
        activeMembers={activeMembers}
        seanceActive={seanceActive}
        rows={rows}
        dict={pageDict}
      />
    </div>
  );
}
