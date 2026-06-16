"use client";

import { useRouter } from "next/navigation";
import { useCommissionDetailQuery } from "@/services/admin";
import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface CommissionDetailPageProps {
  locale: string;
  commissionId: string;
  dict: CommonDict["dashboard"]["admin"]["commissionsPage"];
}

const typeLabels: Record<string, string> = {
  TRAVAUX: "Travaux",
  FOURNITURES: "Fournitures",
  SERVICES: "Services",
};

const statutStyles: Record<string, { bg: string; text: string }> = {
  EN_COURS: { bg: "bg-blue-50", text: "text-blue-600" },
  DELIBERATION: { bg: "bg-amber-50", text: "text-amber-600" },
  ATTRIBUEE: { bg: "bg-green-50", text: "text-green-600" },
  ANNULEE: { bg: "bg-red-50", text: "text-red-600" },
  INFRUCTUEUSE: { bg: "bg-gray-100", text: "text-gray-500" },
};

const statutLabels: Record<string, string> = {
  EN_COURS: "En cours",
  DELIBERATION: "Délibération",
  ATTRIBUEE: "Attribuée",
  ANNULEE: "Annulée",
  INFRUCTUEUSE: "Infructueuse",
};

const roleLabels: Record<string, string> = {
  PRESIDENT: "Président",
  MEMBRE: "Membre",
  RAPPORTEUR: "Rapporteur",
  CONTROLEUR: "Contrôleur",
  OBSERVATEUR: "Observateur",
};

export default function CommissionDetailPage({
  locale,
  commissionId,
  dict,
}: CommissionDetailPageProps) {
  const router = useRouter();
  const { data: commission, isLoading } =
    useCommissionDetailQuery(commissionId);

  if (isLoading) {
    return (
      <div className="p-6 space-y-5 max-w-5xl mx-auto flex justify-center items-center h-64">
        <div className="flex items-center gap-3 text-gray-500">
          <svg
            className="w-5 h-5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Chargement des détails...</span>
        </div>
      </div>
    );
  }

  if (!commission) {
    return (
      <div className="p-6 space-y-5 max-w-5xl mx-auto flex justify-center items-center h-64">
        <span className="text-red-500">
          Commission introuvable ou erreur de chargement.
        </span>
      </div>
    );
  }

  const initials = commission.intitule
    ?.split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "CM";

  const statutStyle = statutStyles[commission.statut] ?? {
    bg: "bg-gray-100",
    text: "text-gray-500",
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Retour aux commissions
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold"
            style={{ backgroundColor: "#1e2535" }}
          >
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {commission.intitule}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                {typeLabels[commission.typeMarche] ?? commission.typeMarche}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statutStyle.bg} ${statutStyle.text}`}
              >
                {statutLabels[commission.statut] ?? commission.statut}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* General Information */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Informations générales
          </h2>
          {[
            { label: "Référence", value: commission.reference || "—" },
            { label: "Intitulé", value: commission.intitule },
            {
              label: "Type de marché",
              value:
                typeLabels[commission.typeMarche] ?? commission.typeMarche,
            },
            {
              label: "Statut",
              value: statutLabels[commission.statut] ?? commission.statut,
            },
            {
              label: "Montant estimé",
              value: commission.montantEstime
                ? `${commission.montantEstime.toLocaleString(
                    locale === "ar" ? "ar-DZ" : "fr-DZ"
                  )} DZD`
                : "—",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0"
            >
              <span className="text-xs text-gray-400">{item.label}</span>
              <span className="text-xs font-semibold text-gray-700">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Dates & Counts */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Dates et statistiques
          </h2>
          {[
            {
              label: "Date ouverture offres",
              value: commission.dateOuvertureOffres
                ? new Date(commission.dateOuvertureOffres).toLocaleDateString(
                    locale === "ar" ? "ar-DZ" : "fr-DZ"
                  )
                : "—",
            },
            {
              label: "Date délibérations",
              value: commission.dateDeliberations
                ? new Date(commission.dateDeliberations).toLocaleDateString(
                    locale === "ar" ? "ar-DZ" : "fr-DZ"
                  )
                : "—",
            },
            {
              label: "Soumissionnaires",
              value: commission.soumissionnairesCount?.toString() ?? "0",
            },
            {
              label: "Soumissionnaire retenu",
              value: commission.soumissionnairesRetenu || "—",
            },
            {
              label: "Créé le",
              value: commission.createdAt
                ? new Date(commission.createdAt).toLocaleDateString(
                    locale === "ar" ? "ar-DZ" : "fr-DZ"
                  )
                : "—",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex justify-between items-start py-1.5 border-b border-gray-50 last:border-0 gap-4"
            >
              <span className="text-xs text-gray-400 flex-shrink-0">
                {item.label}
              </span>
              <span className="text-xs font-semibold text-gray-700 text-right">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PV Délibération */}
      {commission.pvDeliberation && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            PV de Délibération
          </h2>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">
            {commission.pvDeliberation}
          </p>
        </div>
      )}

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Membres de la commission ({commission.membres?.length ?? 0})
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Nom
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Fonction
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Rôle
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Date nomination
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(!commission.membres || commission.membres.length === 0) ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-sm text-gray-400"
                >
                  Aucun membre assigné à cette commission.
                </td>
              </tr>
            ) : (
              commission.membres.map((membre) => (
                <tr
                  key={membre.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: "#1e2535" }}
                      >
                        {(membre.prenom?.[0] ?? "")}{(membre.nom?.[0] ?? "")}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {membre.prenom} {membre.nom}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {membre.fonction || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                      {roleLabels[membre.role] ?? membre.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {membre.dateNomination
                      ? new Date(membre.dateNomination).toLocaleDateString(
                          locale === "ar" ? "ar-DZ" : "fr-DZ"
                        )
                      : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        membre.actif
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {membre.actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer meta */}
      <p className="text-xs text-gray-400">
        Créé le{" "}
        {commission.createdAt
          ? new Date(commission.createdAt).toLocaleDateString(
              locale === "ar" ? "ar-DZ" : "fr-DZ"
            )
          : "N/A"}{" "}
        · Dernière mise à jour le{" "}
        {commission.updatedAt
          ? new Date(commission.updatedAt).toLocaleDateString(
              locale === "ar" ? "ar-DZ" : "fr-DZ"
            )
          : "N/A"}
      </p>
    </div>
  );
}
