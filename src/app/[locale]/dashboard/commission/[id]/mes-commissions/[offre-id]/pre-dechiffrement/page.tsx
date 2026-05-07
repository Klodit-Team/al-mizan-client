import Link from "next/link";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

interface PageProps {
  params: Promise<{ locale: Locale; id: string; "offre-id": string }>;
}

const MOCK_AO = {
  reference: "AO-2023-089",
  objet: "Acquisition Matériel IT",
};

const MOCK_MEMBERS = [
  { name: "Dr. Amine Mansour", initials: "AM" },
  { name: "Sarah Benali", initials: "SB" },
  { name: "Karim Touati", initials: "KT" },
];

const MOCK_SUBMISSIONS = [
  { reference: "S-2023-001", operator: "TechSolutions SPA", received: true, compliant: true, observations: "Aucune..." },
  { reference: "S-2023-004", operator: "Global Network SA", received: true, compliant: false, observations: "Manque RC" },
  { reference: "S-2023-012", operator: "Micro Systems", received: false, compliant: false, observations: "-" },
];

export default async function PreDechiffrementPage({ params }: PageProps) {
  const { locale, id, "offre-id": offreId } = await params;
  const dict = await getDictionary(locale);
  const pageDict = dict.dashboard.commission.preDechiffrementPage;
  const isAr = locale === "ar";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6" style={{ direction: isAr ? "rtl" : "ltr" }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{pageDict.titleBarLabel}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">{pageDict.sessionTitle}</h1>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{pageDict.titleBarBadge}</span>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            {pageDict.sessionSubTitle.replace("{{reference}}", MOCK_AO.reference).replace("{{objet}}", MOCK_AO.objet)}
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
            {MOCK_MEMBERS.map((member) => (
              <span key={member.name} className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold">{member.initials}</span>
                {member.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
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
            {MOCK_SUBMISSIONS.map((item) => (
              <tr key={item.reference} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-3 font-medium text-slate-900">{item.reference}</td>
                <td className="py-4 px-3">{item.operator}</td>
                <td className="py-4 px-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${item.received ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {item.received ? "Oui" : "Non"}
                  </span>
                </td>
                <td className="py-4 px-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${item.compliant ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {item.compliant ? "Oui" : "Non"}
                  </span>
                </td>
                <td className="py-4 px-3 text-slate-500">{item.observations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {pageDict.processedSummary.replace("{{treated}}", String(MOCK_SUBMISSIONS.length)).replace("{{total}}", String(MOCK_SUBMISSIONS.length))}
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
