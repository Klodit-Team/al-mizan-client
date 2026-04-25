"use client";

import { useParams, useRouter } from "next/navigation";
import {
  type OeDashboardData,
  type OeActivityItem,
  type OeDeadlineItem,
  type OeSubmissionItem,
} from "@/services/operateur-dashboard/api";
import { useOperateurDashboardQuery } from "@/services/operateur-dashboard/queries";
import { type Locale } from "@/i18n/config";
import {
  Search, FileText, Clock, Award, AlertTriangle, ChevronRight,
  Bell, Calendar, TrendingUp, Scale, ArrowRight,
} from "lucide-react";

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon, iconBg, valueColor,
}: {
  label: string; value: number; sub: string;
  icon: React.ReactNode; iconBg: string; valueColor: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{sub}</span>
      </div>
      <p className={`mt-3 text-3xl font-black leading-none ${valueColor}`}>
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    </article>
  );
}

// ─── Activity icon ────────────────────────────────────────────────────────────

function ActivityIcon({ type }: { type: OeActivityItem["type"] }) {
  const config = {
    SOUMISSION:   { bg: "bg-emerald-100", text: "text-emerald-600", icon: <FileText className="h-3.5 w-3.5" /> },
    NOTIFICATION: { bg: "bg-blue-100",    text: "text-blue-600",    icon: <Bell className="h-3.5 w-3.5" /> },
    RECOURS:      { bg: "bg-rose-100",    text: "text-rose-600",    icon: <Scale className="h-3.5 w-3.5" /> },
    RESULTAT:     { bg: "bg-amber-100",   text: "text-amber-600",   icon: <Award className="h-3.5 w-3.5" /> },
  }[type];
  return (
    <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${config.bg} ${config.text}`}>
      {config.icon}
    </span>
  );
}

// ─── Submission status helpers ────────────────────────────────────────────────

const SUB_STATUS: Record<OeSubmissionItem["status"], { label: string; cls: string }> = {
  brouillon: { label: "Brouillon",  cls: "bg-slate-100 text-slate-600" },
  deposee:   { label: "Déposée",    cls: "bg-blue-100 text-blue-700" },
  recue:     { label: "Reçue",      cls: "bg-sky-100 text-sky-700" },
  evaluee:   { label: "Évaluée",    cls: "bg-violet-100 text-violet-700" },
  retenue:   { label: "Retenue",    cls: "bg-emerald-100 text-emerald-700" },
  rejetee:   { label: "Rejetée",    cls: "bg-rose-100 text-rose-700" },
};

// ─── Deadline urgency ─────────────────────────────────────────────────────────

function urgencyBadge(urgency: OeDeadlineItem["urgency"]) {
  switch (urgency) {
    case "high":   return "border-rose-200 bg-rose-50 text-rose-600";
    case "medium": return "border-amber-200 bg-amber-50 text-amber-600";
    case "low":    return "border-emerald-200 bg-emerald-50 text-emerald-600";
  }
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, icon, action, onAction }: {
  title: string; icon?: React.ReactNode; action?: string; onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-slate-400">{icon}</span>}
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h2>
      </div>
      {action && (
        <button type="button" onClick={onAction}
          className="flex items-center gap-1 text-[11px] font-semibold text-[#4CAF50] hover:underline">
          {action} <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OperateurDashboard() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) || "fr";
  const { data, isLoading, error } = useOperateurDashboardQuery();

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-16 rounded-xl bg-slate-200" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-slate-200" />)}
        </div>
        <div className="grid gap-3 xl:grid-cols-3">
          <div className="xl:col-span-2 h-64 rounded-xl bg-slate-200" />
          <div className="h-64 rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error?.message || "Impossible de charger le tableau de bord operateur."}
      </div>
    );
  }

  const now = new Date().toLocaleDateString("fr-DZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{now}</p>
          <h1 className="mt-0.5 text-xl font-bold text-slate-900">
            Bonjour, <span style={{ color: "#4CAF50" }}>{data.userName}</span>
          </h1>
          <p className="text-xs text-slate-500">{data.companyName}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/dashboard/operateur/appels-offres`)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#4CAF50" }}
        >
          <Search className="h-4 w-4" />
          Parcourir les AOs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="AOs Actifs"
          value={data.stats.aoActifs}
          sub="LIVE"
          icon={<TrendingUp className="h-4.5 w-4.5" />}
          iconBg="bg-emerald-100 text-emerald-700"
          valueColor="text-emerald-700"
        />
        <StatCard
          label="Soumissions en cours"
          value={data.stats.soumissionsEnCours}
          sub="EN COURS"
          icon={<FileText className="h-4.5 w-4.5" />}
          iconBg="bg-blue-100 text-blue-700"
          valueColor="text-blue-700"
        />
        <StatCard
          label="Marchés Remportés"
          value={data.stats.marchesRemportes}
          sub="ATTRIBUÉS"
          icon={<Award className="h-4.5 w-4.5" />}
          iconBg="bg-amber-100 text-amber-700"
          valueColor="text-amber-700"
        />
        <StatCard
          label="Recours Ouverts"
          value={data.stats.recoursOuverts}
          sub="SUIVI"
          icon={<Scale className="h-4.5 w-4.5" />}
          iconBg="bg-rose-100 text-rose-700"
          valueColor="text-rose-700"
        />
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Actions Rapides</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Parcourir les AOs",  icon: <Search className="h-5 w-5" />,    href: `/${locale}/dashboard/operateur/appels-offres`, color: "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
            { label: "Mes Soumissions",    icon: <FileText className="h-5 w-5" />,   href: `/${locale}/dashboard/operateur/soumissions`,   color: "text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200" },
            { label: "Mes Recours",        icon: <Scale className="h-5 w-5" />,      href: `/${locale}/dashboard/operateur/recours`,       color: "text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200" },
            { label: "Notifications",      icon: <Bell className="h-5 w-5" />,       href: `/${locale}/dashboard/operateur/notifications`,  color: "text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-200" },
          ].map((a) => (
            <button key={a.href} type="button" onClick={() => router.push(a.href)}
              className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-colors ${a.color}`}>
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-4 xl:grid-cols-3">

        {/* Left column */}
        <div className="space-y-4 xl:col-span-2">

          {/* Activity feed */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              title="Activité Récente"
              icon={<Bell className="h-3.5 w-3.5" />}
              action="Voir tout"
              onAction={() => router.push(`/${locale}/dashboard/operateur/notifications`)}
            />
            <ul className="divide-y divide-slate-50">
              {data.activities.map((item) => (
                <li key={item.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50/60 transition-colors">
                  <ActivityIcon type={item.type} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{item.subtitle}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-400 whitespace-nowrap">{item.timestamp}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Recent submissions */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              title="Mes Soumissions Récentes"
              icon={<FileText className="h-3.5 w-3.5" />}
              action="Voir tout"
              onAction={() => router.push(`/${locale}/dashboard/operateur/soumissions`)}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Référence", "Objet", "Date dépôt", "Statut"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.recentSubmissions.map((sub) => {
                    const sm = SUB_STATUS[sub.status];
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                        onClick={() => router.push(`/${locale}/dashboard/operateur/soumissions`)}>
                        <td className="px-4 py-2.5 font-mono font-semibold text-slate-700">{sub.aoReference}</td>
                        <td className="max-w-50 truncate px-4 py-2.5 text-slate-600">{sub.aoObject}</td>
                        <td className="px-4 py-2.5 text-slate-500">
                          {new Date(sub.submittedAt).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${sm.cls}`}>{sm.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Deadlines */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader title="Échéances Prochaines" icon={<Calendar className="h-3.5 w-3.5" />} />
            <ul className="divide-y divide-slate-50 px-3 py-2">
              {data.deadlines.map((dl) => (
                <li key={dl.id} className="flex items-center gap-3 py-2.5">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-slate-700">{dl.title}</p>
                    <span className={`mt-0.5 inline-flex rounded-full border px-2 py-px text-[10px] font-semibold ${urgencyBadge(dl.urgency)}`}>
                      {dl.dueAt}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 px-4 py-2.5">
              <button type="button"
                className="flex w-full items-center justify-center gap-1 text-[11px] font-semibold text-[#4CAF50] hover:underline">
                Calendrier complet <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </section>

          {/* Open recours */}
          {data.openRecours.length > 0 && (
            <section className="overflow-hidden rounded-xl border border-rose-200 bg-rose-50 shadow-sm">
              <div className="flex items-center gap-2 border-b border-rose-100 px-4 py-3">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600">Recours en cours</h2>
              </div>
              <ul className="divide-y divide-rose-100 px-3 py-2">
                {data.openRecours.map((rec) => (
                  <li key={rec.id} className="py-2.5 cursor-pointer"
                    onClick={() => router.push(`/${locale}/dashboard/operateur/recours`)}>
                    <p className="text-[11px] font-semibold text-rose-700">{rec.aoReference}</p>
                    <p className="text-[10px] text-rose-600 truncate">{rec.aoObject}</p>
                    <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-px text-[10px] font-semibold text-amber-700">
                      En examen
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-rose-100 px-4 py-2.5">
                <button type="button" onClick={() => router.push(`/${locale}/dashboard/operateur/recours`)}
                  className="flex w-full items-center justify-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline">
                  Voir mes recours <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </section>
          )}

          {/* Support */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Support & Guides</h2>
            <div className="space-y-2">
              {[
                "Guide du soumissionnaire 2024",
                "Contacter le support technique",
                "FAQ & questions fréquentes",
              ].map((label) => (
                <button key={label} type="button"
                  className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                  <span>{label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}