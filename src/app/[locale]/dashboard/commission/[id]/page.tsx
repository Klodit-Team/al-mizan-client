import Link from "next/link";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

interface PageProps {
  params: Promise<{ locale: Locale; id: string }>;
}

export default async function CommissionDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const dict = await getDictionary(locale);
  const pageDict = dict.dashboard.commission.commissionDetailPage;
  const roleDict = dict.dashboard.commission.mesCommissionsPage.roles;
  const aoId = "AO-2023-089";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6" style={{ direction: locale === "ar" ? "rtl" : "ltr" }}>
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/${locale}/dashboard/commission/mes-commissions`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </span>
          <span>{pageDict.backLabel}</span>
        </Link>
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-emerald-700 text-sm font-semibold shadow-sm">
          {pageDict.statusActive}
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400 mb-2">{pageDict.pageHeaderTitle}</p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950">{pageDict.pageMainTitle}</h1>
            <p className="text-base text-slate-500 mt-3">
              {pageDict.linkedTo} {aoId} · {pageDict.procurementObject}
            </p>
          </div>
          <div className="rounded-3xl bg-[#4CAF50] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/50">
            {pageDict.statusActive}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{pageDict.membersTitle}</h2>
                <p className="text-sm text-slate-500 mt-1">{pageDict.membersSubtitle}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { name: "Dr. Amine Mansour", role: roleDict.president },
                { name: "Sarah Benali", role: roleDict.rapporteur },
                { name: "Karim Touati", role: roleDict.evaluateur },
              ].map((member) => (
                <div key={member.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{member.name}</p>
                  <p className="text-sm text-slate-500 mt-1">{member.role}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{pageDict.sessionsTitle}</h2>
                <p className="text-sm text-slate-500 mt-1">{pageDict.sessionsSubtitle}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{pageDict.technicalSessionStatus}</p>
                    <p className="text-sm text-slate-500 mt-1">{pageDict.technicalSessionLabel}</p>
                    <p className="text-xs text-slate-400 mt-2">15 Nov 2023</p>
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition">
                    {pageDict.downloadPV}
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-900">{pageDict.financialSessionStatus}</p>
                    <p className="text-sm text-slate-500 mt-1">{pageDict.financialSessionLabel}</p>
                    <p className="text-xs text-slate-400 mt-2">20 Nov 2023</p>
                    <p className="text-xs text-amber-700 mt-1">{pageDict.requiresAllMembers}</p>
                  </div>
                  <Link
                    href={`/${locale}/dashboard/commission/${id}/mes-commissions/${aoId}/pre-dechiffrement`}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#4CAF50] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#4CAF50]/30 hover:bg-[#43A047] transition"
                  >
                    {pageDict.accessSession}
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{pageDict.informationPanelTitle}</h3>
            <dl className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <dt>{pageDict.informationPanelDateCreation}</dt>
                <dd>12 Oct 2023</dd>
              </div>
              <div className="flex justify-between">
                <dt>{pageDict.informationPanelMembers}</dt>
                <dd>5</dd>
              </div>
              <div className="flex justify-between">
                <dt>{pageDict.informationPanelPhase}</dt>
                <dd>{pageDict.openingPhase}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-900">{pageDict.currentFlowTitle}</p>
            <ol className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="rounded-2xl bg-white p-3">1. {pageDict.currentFlowStep1}</li>
              <li className="rounded-2xl bg-white p-3">2. {pageDict.currentFlowStep2}</li>
              <li className="rounded-2xl bg-white p-3">3. {pageDict.currentFlowStep3}</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
