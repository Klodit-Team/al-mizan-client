"use client";
import { useState, useEffect } from "react";
import NotificationCard from "@/components/dashboard/admin/NotificationCard";
import type { getDictionary } from "@/i18n/get-dictionaries";
import {
  type NotificationCategorie,
  type NotificationEntity,
  type NotificationPreferences,
} from "@/services/admin/notifications/api";
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useAlertesIAQuery,
  useAcquitterAlerteMutation,
  useResoudreAlerteMutation,
  useRapportsIAQuery,
  useGenererRapportMutation,
  useNotificationPreferencesQuery,
  useUpdatePreferencesMutation
} from "@/services/admin/notifications/queries";

export type FilterCategory = NotificationCategorie | "all";
export type Tab = "NOTIFICATIONS" | "ALERTES_IA" | "RAPPORTS_IA" | "PREFERENCES";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface NotificationsPageProps {
  dict: CommonDict["dashboard"]["admin"]["notificationsPage"];
}

export default function NotificationsPageClient({ dict }: NotificationsPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("NOTIFICATIONS");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        
        {/* Header & Tabs */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{dict.title ?? "Centre de Notifications & IA"}</h1>
          <p className="text-sm text-gray-500 mt-1">{dict.subtitle ?? "Gérez vos notifications, alertes et rapports d'intelligence artificielle."}</p>
          
          <div className="flex flex-wrap gap-2 mt-6 border-b border-gray-200 pb-px">
            <TabButton active={activeTab === "NOTIFICATIONS"} onClick={() => setActiveTab("NOTIFICATIONS")} label="Notifications" />
            <TabButton active={activeTab === "ALERTES_IA"} onClick={() => setActiveTab("ALERTES_IA")} label="Alertes IA" />
            <TabButton active={activeTab === "RAPPORTS_IA"} onClick={() => setActiveTab("RAPPORTS_IA")} label="Rapports IA" />
            <TabButton active={activeTab === "PREFERENCES"} onClick={() => setActiveTab("PREFERENCES")} label="Préférences" />
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "NOTIFICATIONS" && <NotificationsTab dict={dict} />}
          {activeTab === "ALERTES_IA" && <AlertesIATab />}
          {activeTab === "RAPPORTS_IA" && <RapportsIATab />}
          {activeTab === "PREFERENCES" && <PreferencesTab />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
        active 
          ? "border-indigo-600 text-indigo-600 bg-indigo-50/50" 
          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Tab: Notifications ────────────────────────────────────────────────────────

function NotificationsTab({ dict }: { dict: any }) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useNotificationsQuery({
    page,
    limit: 50,
    isLue: unreadOnly ? false : undefined,
    categorie: activeCategory === "all" ? undefined : activeCategory
  });

  const markReadMut = useMarkNotificationReadMutation();
  const markAllReadMut = useMarkAllNotificationsReadMutation();

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isLue).length;

  const categoriesList: { key: FilterCategory; label: string }[] = [
    { key: "all", label: dict.categories?.all ?? "Toutes" },
    { key: "PUBLICATION", label: dict.categories?.publication_ao ?? "Publication" },
    { key: "DEPOT", label: dict.categories?.depot_confirme ?? "Dépôt" },
    { key: "OUVERTURE", label: dict.categories?.ouverture_plis ?? "Ouverture" },
    { key: "EVALUATION", label: dict.categories?.evaluation_resultat ?? "Évaluation" },
    { key: "ATTRIBUTION", label: dict.categories?.attribution_provisoire ?? "Attribution" },
    { key: "RECOURS", label: dict.categories?.recours_update ?? "Recours" },
    { key: "SYSTEME", label: dict.categories?.systeme ?? "Système" },
    { key: "IA_DIVERGENCE", label: "IA Divergence" },
    { key: "IA_ERREUR", label: "IA Erreur" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categoriesList.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat.key
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Non lues uniquement</span>
            <button
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={`relative w-10 h-5 rounded-full transition-colors ${unreadOnly ? "bg-indigo-600" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${unreadOnly ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <button
            onClick={() => markAllReadMut.mutate()}
            disabled={unreadCount === 0 || markAllReadMut.isPending}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-40"
          >
            {markAllReadMut.isPending ? "Traitement..." : dict.markAllAsRead ?? "Tout marquer comme lu"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Chargement...</div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm">{dict.noNotifications ?? "Aucune notification trouvée."}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={(id) => markReadMut.mutate(id)}
                dict={dict}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Alertes IA ───────────────────────────────────────────────────────────

function AlertesIATab() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  
  const { data, isLoading } = useAlertesIAQuery({ page, limit: 20, statut: status || undefined });
  const alertes = data?.data ?? [];

  const acquitterMut = useAcquitterAlerteMutation();
  const resoudreMut = useResoudreAlerteMutation();

  const handleAcquitter = (id: string) => {
    const notes = prompt("Notes d'acquittement :");
    if (notes !== null) {
      acquitterMut.mutate({ id, notes });
    }
  };

  const handleResoudre = (id: string) => {
    const notes = prompt("Notes de résolution finale :");
    if (notes !== null) {
      resoudreMut.mutate({ id, notes });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Alertes IA & Incidents</h2>
        <select 
          className="text-sm border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="EMISE">Émise</option>
          <option value="ACQUITTEE">Acquittée</option>
          <option value="RESOLUE">Résolue</option>
        </select>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-gray-400 p-4">Chargement des alertes...</p>
        ) : alertes.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-xl border border-gray-100 text-gray-400 text-sm">
            Aucune alerte trouvée.
          </div>
        ) : (
          alertes.map(alerte => (
            <div key={alerte.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                    alerte.niveauUrgence === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                    alerte.niveauUrgence === 'ERROR' ? 'bg-orange-100 text-orange-700' :
                    alerte.niveauUrgence === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {alerte.niveauUrgence}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                    alerte.statut === 'EMISE' ? 'bg-red-50 text-red-600 border border-red-100' :
                    alerte.statut === 'ACQUITTEE' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                    'bg-green-50 text-green-600 border border-green-100'
                  }`}>
                    {alerte.statut}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{alerte.typeAlerte}</span>
                </div>
                <h3 className="text-base font-bold text-gray-800">{alerte.titre}</h3>
                <p className="text-sm text-gray-600 mt-1 max-w-2xl">{alerte.message}</p>
                <div className="mt-3 text-xs text-gray-400">
                  Émise le {new Date(alerte.dateCreation).toLocaleString()}
                  {alerte.dateAcquittement && ` · Modifiée le ${new Date(alerte.dateAcquittement).toLocaleString()}`}
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-2 shrink-0">
                {alerte.statut === 'EMISE' && (
                  <button onClick={() => handleAcquitter(alerte.id)} className="px-3 py-1.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg text-xs font-semibold transition-colors border border-yellow-100">
                    Acquitter l'Alerte
                  </button>
                )}
                {alerte.statut !== 'RESOLUE' && (
                  <button onClick={() => handleResoudre(alerte.id)} className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors border border-green-100">
                    Marquer Résolue
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Tab: Rapports IA ──────────────────────────────────────────────────────────

function RapportsIATab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useRapportsIAQuery({ page, limit: 20 });
  const rapports = data?.data ?? [];

  const genererMut = useGenererRapportMutation();

  const handleGenerer = () => {
    genererMut.mutate({ typeRapport: "HEBDOMADAIRE" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Rapports d'Activité IA</h2>
          <p className="text-xs text-gray-400">Consultez ou générez des rapports périodiques.</p>
        </div>
        <button 
          onClick={handleGenerer}
          disabled={genererMut.isPending}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {genererMut.isPending ? "Génération..." : "Générer Rapport Hebdomadaire"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <p className="text-sm text-gray-400 p-4">Chargement des rapports...</p>
        ) : rapports.length === 0 ? (
          <div className="col-span-full bg-white p-10 text-center rounded-xl border border-gray-100 text-gray-400 text-sm">
            Aucun rapport généré.
          </div>
        ) : (
          rapports.map(rapport => (
            <div key={rapport.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">Rapport {rapport.typeRapport}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Du {new Date(rapport.periodDebut).toLocaleDateString()} au {new Date(rapport.periodeFin).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  rapport.statut === 'ENVOYE' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {rapport.statut}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Divergences</p>
                  <p className="text-lg font-bold text-red-500">{rapport.divergencesCount}</p>
                </div>
                <div className="text-center border-x border-gray-200">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Erreurs</p>
                  <p className="text-lg font-bold text-orange-500">{rapport.erreursCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Précision</p>
                  <p className="text-lg font-bold text-green-500">{rapport.tauxPrecision}%</p>
                </div>
              </div>

              {rapport.fichierRapportUrl && (
                <a 
                  href={rapport.fichierRapportUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg transition-colors border border-indigo-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Télécharger le PDF
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Tab: Preferences ──────────────────────────────────────────────────────────

function PreferencesTab() {
  const { data: prefs, isLoading } = useNotificationPreferencesQuery();
  const updateMut = useUpdatePreferencesMutation();

  if (isLoading) return <div className="p-4 text-sm text-gray-400">Chargement...</div>;

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    updateMut.mutate({ [key]: value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Préférences de Réception</h2>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">Canaux de Notification</h3>
          
          <ToggleRow 
            label="Email" 
            description="Recevoir les notifications importantes par email." 
            checked={prefs?.emailActif ?? true} 
            onChange={(val) => handleToggle('emailActif', val)} 
          />
          <ToggleRow 
            label="SMS" 
            description="Recevoir des alertes critiques par SMS." 
            checked={prefs?.smsActif ?? false} 
            onChange={(val) => handleToggle('smsActif', val)} 
          />
          <ToggleRow 
            label="Push Mobile" 
            description="Notifications push sur l'application mobile." 
            checked={prefs?.pushActif ?? true} 
            onChange={(val) => handleToggle('pushActif', val)} 
          />
          <ToggleRow 
            label="Plateforme Web" 
            description="Afficher les alertes dans le centre de notifications web." 
            checked={prefs?.plateformeActif ?? true} 
            onChange={(val) => handleToggle('plateformeActif', val)} 
          />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-gray-200"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}
