"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getOeDashboardData,
  type OeDashboardData,
  type OeActivityItem,
  type OeDeadlineItem,
  type OeSubmissionItem,
} from "@/services/operateur-dashboard";
import { type Locale } from "@/i18n/config";
import {
  Search,
  FileText,
  Clock,
  Award,
  AlertTriangle,
  ChevronRight,
  Bell,
  Calendar,
  TrendingUp,
  Briefcase,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  badge,
  icon,
  colorClass,
  iconBg,
  badgeBg,
}: {
  label: string;
  value: number;
  badge: string;
  icon: React.ReactNode;
  colorClass: string;
  iconBg: string;
  badgeBg: string;
}) {
  return (
    <article
      className={`rounded-xl border border-gray-200 bg-linear-to-br p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md ${colorClass}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}
        >
          {icon}
        </span>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${badgeBg}`}
        >
          {badge}
        </span>
      </div>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold leading-none text-[#364150]">
        {String(value).padStart(2, "0")}
      </p>
    </article>
  );
}

function activityIcon(type: OeActivityItem["type"]) {
  switch (type) {
    case "SOUMISSION":
      return (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <FileText className="h-3.5 w-3.5" />
        </span>
      );
    case "NOTIFICATION":
      return (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Bell className="h-3.5 w-3.5" />
        </span>
      );
    case "RECOURS":
      return (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangle className="h-3.5 w-3.5" />
        </span>
      );
    case "RESULTAT":
      return (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Award className="h-3.5 w-3.5" />
        </span>
      );
  }
}

function urgencyColor(urgency: OeDeadlineItem["urgency"]) {
  switch (urgency) {
    case "high":
      return "text-rose-600 bg-rose-50 border-rose-200";
    case "medium":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "low":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
  }
}

function submissionStatusBadge(status: OeSubmissionItem["status"]) {
  switch (status) {
    case "brouillon":
      return "bg-slate-100 text-slate-600";
    case "deposee":
      return "bg-blue-100 text-blue-700";
    case "recue":
      return "bg-sky-100 text-sky-700";
    case "evaluee":
      return "bg-violet-100 text-violet-700";
    case "retenue":
      return "bg-emerald-100 text-emerald-700";
    case "rejetee":
      return "bg-rose-100 text-rose-700";
  }
}

function submissionStatusLabel(status: OeSubmissionItem["status"]) {
  switch (status) {
    case "brouillon": return "Brouillon";
    case "deposee": return "Déposée";
    case "recue": return "Reçue";
    case "evaluee": return "Évaluée";
    case "retenue": return "Retenue";
    case "rejetee": return "Rejetée";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function OperateurDashboard() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) || "fr";

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<OeDashboardData | null>(null);

  useEffect(() => {
    let alive = true;
    getOeDashboardData().then((res: OeDashboardData) => {
      if (alive) {
        setData(res);
        setIsLoading(false);
      }
    });
    return () => { alive = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <div className="xl:col-span-2 h-64 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-3">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-bold uppercase tracking-[0.03em] text-slate-900">
            Tableau de Bord — Opérateur Économique
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Bienvenue,{" "}
            <span className="font-semibold text-slate-700">{data.userName}</span>{" "}
            &middot;{" "}
            <span className="text-slate-600">{data.companyName}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/dashboard/operateur/appels-offres`)}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#4CAF50" }}
        >
          <Search className="h-4 w-4" />
          Parcourir les Appels d&apos;Offres
        </button>
      </header>

      {/* ── Stats cards ────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="AOs Publiés Actifs"
          value={data.stats.aoActifs}
          badge="LIVE"
          colorClass="from-emerald-50 to-white"
          iconBg="bg-emerald-100 text-emerald-700"
          badgeBg="bg-emerald-100 text-emerald-700"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Soumissions en cours"
          value={data.stats.soumissionsEnCours}
          badge="EN COURS"
          colorClass="from-blue-50 to-white"
          iconBg="bg-blue-100 text-blue-700"
          badgeBg="bg-blue-100 text-blue-700"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          label="Marchés Remportés"
          value={data.stats.marchesRemportes}
          badge="ATTRIBUÉS"
          colorClass="from-amber-50 to-white"
          iconBg="bg-amber-100 text-amber-700"
          badgeBg="bg-amber-100 text-amber-700"
          icon={<Award className="h-4 w-4" />}
        />
        <StatCard
          label="Recours Ouverts"
          value={data.stats.recoursOuverts}
          badge="ALERTE"
          colorClass="from-rose-50 to-white"
          iconBg="bg-rose-100 text-rose-700"
          badgeBg="bg-rose-100 text-rose-700"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </section>

      {/* ── Quick actions ───────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
          Actions Rapides
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            {
              label: "Parcourir les AOs",
              icon: <Search className="h-5 w-5" />,
              href: `/${locale}/dashboard/operateur/appels-offres`,
              color: "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
            },
            {
              label: "Mes Soumissions",
              icon: <FileText className="h-5 w-5" />,
              href: `/${locale}/dashboard/operateur/soumissions`,
              color: "text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200",
            },
            {
              label: "Mes Recours",
              icon: <Briefcase className="h-5 w-5" />,
              href: `/${locale}/dashboard/operateur/recours`,
              color: "text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200",
            },
            {
              label: "Mes Marchés",
              icon: <Award className="h-5 w-5" />,
              href: `/${locale}/dashboard/operateur/marches`,
              color: "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200",
            },
          ].map((action) => (
            <button
              key={action.href}
              type="button"
              onClick={() => router.push(action.href)}
              className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-colors ${action.color}`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Main content row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {/* Left: Activity + Submissions */}
        <div className="space-y-3 xl:col-span-2">
          {/* Activity feed */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Activité Récente
              </h2>
              <button
                type="button"
                className="text-[11px] font-semibold uppercase tracking-wide text-[#4CAF50] hover:underline"
              >
                Voir tout
              </button>
            </div>
            <ul className="divide-y divide-slate-50">
              {data.activities.map((item) => (
                <li key={item.id} className="flex items-start gap-3 px-4 py-3">
                  {activityIcon(item.type)}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{item.subtitle}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-400">{item.timestamp}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Recent Submissions */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Mes Soumissions Récentes
              </h2>
              <button
                type="button"
                onClick={() => router.push(`/${locale}/dashboard/operateur/soumissions`)}
                className="text-[11px] font-semibold uppercase tracking-wide text-[#4CAF50] hover:underline"
              >
                Voir tout
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">
                      Référence
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">
                      Objet
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">
                      Date dépôt
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.recentSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-medium text-slate-700">
                        {sub.aoReference}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 max-w-55 truncate">
                        {sub.aoObject}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {new Date(sub.submittedAt).toLocaleDateString("fr-DZ")}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${submissionStatusBadge(sub.status)}`}
                        >
                          {submissionStatusLabel(sub.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right: Deadlines + Recours */}
        <div className="space-y-3">
          {/* Deadlines */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Échéances Prochaines
              </h2>
            </div>
            <ul className="divide-y divide-slate-50 px-3 py-2">
              {data.deadlines.map((dl) => (
                <li key={dl.id} className="flex items-center gap-3 py-2.5">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-slate-700">{dl.title}</p>
                    <span
                      className={`mt-0.5 inline-flex rounded-full border px-2 py-px text-[10px] font-semibold ${urgencyColor(dl.urgency)}`}
                    >
                      {dl.dueAt}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 px-4 py-2.5">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-1 text-[11px] font-semibold text-[#4CAF50] hover:underline"
              >
                Ouvrir le calendrier complet
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </section>

          {/* Open Recours */}
          {data.openRecours.length > 0 && (
            <section className="rounded-xl border border-rose-200 bg-rose-50 shadow-sm">
              <div className="flex items-center gap-2 border-b border-rose-100 px-4 py-3">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600">
                  Recours en cours
                </h2>
              </div>
              <ul className="divide-y divide-rose-100 px-3 py-2">
                {data.openRecours.map((rec) => (
                  <li key={rec.id} className="py-2.5">
                    <p className="text-[11px] font-semibold text-rose-700">{rec.aoReference}</p>
                    <p className="text-[11px] text-rose-600">{rec.aoObject}</p>
                    <p className="mt-1 text-[10px] text-rose-500 italic">{rec.motif}</p>
                    <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-px text-[10px] font-semibold text-amber-700">
                      En examen
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Support */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              Support & Guide
            </h2>
            <div className="space-y-2">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span>Guide du soumissionnaire 2024</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span>Contacter le support technique</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}