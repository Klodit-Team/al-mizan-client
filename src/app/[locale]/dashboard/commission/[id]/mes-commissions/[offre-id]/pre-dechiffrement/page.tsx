import Link from "next/link";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";
import { apiClient } from "@/services/client";
import type {
  CommissionEvaluation,
  MembreEvaluation,
  ResultatOuverture,
  SeanceOuverture,
} from "@/services/commission-dashboard/api";

interface PageProps {
  params: Promise<{ locale: Locale; id: string; "offre-id": string }>;
}

interface SubmissionItem {
  id: string;
  reference: string;
  operatorName: string;
  status: string;
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

function Badge({ children, active }: { children: string; active: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
      {children}
    </span>
  );
}

export default async function PreDechiffrementPage({ params }: PageProps) {
  const { locale, id, "offre-id": offreId } = await params;
  const dict = await getDictionary(locale);
  const pageDict = dict.dashboard.commission.preDechiffrementPage;
  const isAr = locale === "ar";

  const [commission, membres, seances, submissions] = await Promise.all([
    apiClient<CommissionEvaluation>(`/api/v1/commissions-evaluation/${id}`).catch(() => null),
    apiClient<MembreEvaluation[]>(`/api/v1/commissions-evaluation/${id}/membres`).catch(() => []),
    apiClient<SeanceOuverture[]>(`/api/v1/seances-ouverture?commissionId=${id}`).catch(() => []),
    apiClient<SubmissionItem[]>(`/api/v1/soumissions/appel-offre/${offreId}`).catch(() => []),
  ]);

  const seanceActive = seances.find((seance) => seance.appelOffreId === offreId) ?? seances[0] ?? null;
  const resultats = seanceActive
    ? await apiClient<ResultatOuverture[]>(`/api/v1/seances-ouverture/${seanceActive.id}/resultats`).catch(() => [])
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
    <div className="p-6 max-w-6xl mx-auto space-y-6" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{pageDict.titleBarLabel}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">{pageDict.sessionTitle}</h1>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{pageDict.titleBarBadge}</span>
            {seanceActive && <Badge active={seanceActive.statut !== "PROGRAMMEE"}>{seanceActive.statut}</Badge>}
          </div>
          <p className="text-sm text-slate-500 mt-2">
            {pageDict.sessionSubTitle
              .replace("{{reference}}", commission.reference)
              .replace("{{objet}}", commission.objet)}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          {pageDict.statusLabel}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">{pageDict.membersPresentTitle}</p>
            <p className="text-sm font-semibold text-slate-900 mt-2">{pageDict.membersPresentSubtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {activeMembers.length === 0 ? (
              <span className="text-sm text-slate-400">{isAr ? "لا يوجد أعضاء نشطون" : "Aucun membre actif"}</span>
            ) : (
              activeMembers.map((member) => (
                <span key={member.id} className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold">
                    {(member.prenom?.[0] ?? "") + (member.nom?.[0] ?? "")}
                  </span>
                  {member.prenom} {member.nom}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
        {rows.length === 0 ? (
          <EmptyState
            locale={locale}
            title={isAr ? "لا توجد عروض" : "Aucune soumission"}
            subtitle={isAr ? "لم يتم إرجاع أي عروض لهذا طلب العرض من الخادم." : "Le backend n'a renvoyé aucune soumission pour cet appel d'offres."}
          />
        ) : (
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 px-3 font-semibold">{pageDict.reference}</th>
                <th className="py-3 px-3 font-semibold">{pageDict.operator}</th>
                <th className="py-3 px-3 font-semibold">{pageDict.received}</th>
                <th className="py-3 px-3 font-semibold">{pageDict.compliant}</th>
                <th className="py-3 px-3 font-semibold">{pageDict.observations}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-3 font-medium text-slate-900">{item.reference}</td>
                  <td className="py-4 px-3">{item.operatorName}</td>
                  <td className="py-4 px-3">
                    <Badge active={item.received}>{item.received ? (isAr ? "نعم" : "Oui") : (isAr ? "لا" : "Non")}</Badge>
                  </td>
                  <td className="py-4 px-3">
                    <Badge active={item.compliant}>{item.compliant ? (isAr ? "نعم" : "Oui") : (isAr ? "لا" : "Non")}</Badge>
                  </td>
                  <td className="py-4 px-3 text-slate-500">{item.observations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {pageDict.processedSummary
            .replace("{{treated}}", String(rows.filter((row) => row.received).length))
            .replace("{{total}}", String(rows.length))}
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 transition">
            {pageDict.saveDraft}
          </button>
          <Link
            href={`/${locale}/dashboard/commission/${id}/mes-commissions/${offreId}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#4CAF50] px-5 py-3 text-sm font-semibold text-white hover:bg-[#43A047] transition"
          >
            {pageDict.proceedToDecryption}
          </Link>
        </div>
      </div>
    </div>
  );
}
