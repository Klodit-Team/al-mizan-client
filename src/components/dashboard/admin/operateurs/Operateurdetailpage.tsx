"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOperateurDetailQuery, useBlacklistOperateurMutation, useUnblacklistOperateurMutation } from "@/services/admin/operateurs/queries";
import { getProfileByUserId } from "@/services/admin/users/api";
import type { ProfileEntity } from "@/components/dashboard/admin/users/types";
import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface OperateurDetailPageProps {
  locale: string;
  dict: CommonDict["dashboard"]["admin"]["operateursPage"];
}

export default function OperateurDetailPage({ locale, dict }: OperateurDetailPageProps) {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: operateur, isLoading, isError } = useOperateurDetailQuery(id);
  const blacklistMutation = useBlacklistOperateurMutation();
  const unblacklistMutation = useUnblacklistOperateurMutation();

  const [profile, setProfile] = useState<ProfileEntity | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [blacklistModal, setBlacklistModal] = useState({ isOpen: false, motif: "" });

  useEffect(() => {
    if (operateur?.userId) {
      setProfileLoading(true);
      getProfileByUserId(operateur.userId)
        .then(setProfile)
        .catch(console.error)
        .finally(() => setProfileLoading(false));
    }
  }, [operateur?.userId]);

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isError || !operateur) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Erreur lors du chargement des détails de l'opérateur.
        </div>
        <button onClick={() => router.back()} className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-semibold">
          &larr; Retour
        </button>
      </div>
    );
  }

  const handleBlacklistSubmit = async () => {
    await blacklistMutation.mutateAsync({ oeId: operateur.id, reason: blacklistModal.motif });
    setBlacklistModal({ isOpen: false, motif: "" });
  };

  const handleUnblacklist = async () => {
    await unblacklistMutation.mutateAsync(operateur.id);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1 text-sm font-semibold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            Détails de l'Opérateur
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${operateur.isBlacklisted ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"}`}>
              {operateur.isBlacklisted ? dict.statusLabels?.blacklisted ?? "Blacklisté" : dict.statusLabels?.active ?? "Actif"}
            </span>
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-mono">ID: {operateur.id}</p>
        </div>
        <div className="flex gap-3">
          {operateur.isBlacklisted ? (
            <button
              onClick={handleUnblacklist}
              disabled={unblacklistMutation.isPending}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            >
              {unblacklistMutation.isPending ? "Traitement..." : dict.actionsLabels?.unblacklist ?? "Retirer de la liste noire"}
            </button>
          ) : (
            <button
              onClick={() => setBlacklistModal({ isOpen: true, motif: "" })}
              className="px-4 py-2 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors shadow-sm"
            >
              {dict.actionsLabels?.blacklist ?? "Blacklister l'opérateur"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-50 pb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Informations de l'Opérateur
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-xs text-gray-400 mb-1">ID Utilisateur (Créateur)</p>
                <p className="text-sm font-semibold text-gray-800 font-mono break-all">{operateur.userId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">ID Organisation</p>
                <p className="text-sm font-semibold text-gray-800 font-mono break-all">{operateur.organisationId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Éligible aux appels d'offres</p>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                  {operateur.isEligible ? (
                    <><div className="w-2 h-2 rounded-full bg-green-500"></div> Oui</>
                  ) : (
                    <><div className="w-2 h-2 rounded-full bg-gray-300"></div> Non</>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Date d'inscription</p>
                <p className="text-sm font-semibold text-gray-800">
                  {new Date(operateur.createdAt).toLocaleDateString(locale === "ar" ? "ar-DZ" : "fr-DZ", {
                    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              </div>
            </div>

            {operateur.isBlacklisted && operateur.raisonBlacklist && (
              <div className="mt-6 bg-red-50 rounded-lg p-4 border border-red-100">
                <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Motif de Blacklist</p>
                <p className="text-sm text-red-600">{operateur.raisonBlacklist}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-50 pb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Qualifications & Catégories
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-2">Qualifications</p>
                <div className="flex flex-wrap gap-2">
                  {operateur.qualifications ? operateur.qualifications.split(",").map((q, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-md">
                      {q.trim()}
                    </span>
                  )) : <span className="text-sm text-gray-400 italic">Aucune qualification</span>}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Catégories</p>
                <div className="flex flex-wrap gap-2">
                  {operateur.categories ? operateur.categories.split(",").map((c, i) => (
                    <span key={i} className="px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold rounded-md">
                      {c.trim()}
                    </span>
                  )) : <span className="text-sm text-gray-400 italic">Aucune catégorie</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Profile */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-16 h-16 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center absolute -top-8 left-6 text-2xl font-bold text-indigo-600">
                {profile ? `${profile.prenom[0]}${profile.nom[0]}`.toUpperCase() : "OE"}
              </div>
              
              <div className="mt-10">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Profil Utilisateur Associé</h3>
                {profileLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </div>
                ) : profile ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400">Nom complet</p>
                      <p className="text-sm font-semibold text-gray-800">{profile.prenom} {profile.nom}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Téléphone</p>
                      <p className="text-sm font-semibold text-gray-800">{profile.telephone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Langue</p>
                      <p className="text-sm font-semibold text-gray-800 uppercase">{profile.langue}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Profil introuvable ou non défini.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blacklist Modal */}
      {blacklistModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{dict.modal?.title ?? "Blacklister l'opérateur"}</h3>
              <button
                onClick={() => setBlacklistModal({ isOpen: false, motif: "" })}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Vous êtes sur le point de blacklister l'opérateur. Veuillez indiquer un motif obligatoire.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                <textarea
                  value={blacklistModal.motif}
                  onChange={(e) => setBlacklistModal({ ...blacklistModal, motif: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 text-sm bg-white text-gray-900"
                  rows={4}
                  placeholder="Justification..."
                  required
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setBlacklistModal({ isOpen: false, motif: "" })}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleBlacklistSubmit}
                disabled={!blacklistModal.motif.trim() || blacklistMutation.isPending}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {blacklistMutation.isPending ? "Traitement..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
