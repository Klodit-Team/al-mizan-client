
"use client"
import { useState } from "react";
import NotificationCard from "@/components/dashboard/admin/NotificationCard";
import Navbar from "@/components/layout/Navbar";
import type { getDictionary } from "@/i18n/get-dictionaries";

export type NotificationCategory =
    | "all"
    | "publication_ao"
    | "depot_confirme"
    | "ouverture_plis"
    | "evaluation_resultat"
    | "attribution_provisoire"
    | "attribution_definitive"
    | "recours_update"
    | "systeme";

export interface Notification {
    id: string;
    category: Exclude<NotificationCategory, "all">;
    title: string;
    description: string;
    time: string;
    read: boolean;
}

const categories: { key: NotificationCategory; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "publication_ao", label: "Publication AO" },
    { key: "depot_confirme", label: "Dépôt confirmé" },
    { key: "ouverture_plis", label: "Ouverture plis" },
    { key: "evaluation_resultat", label: "Evaluation résultat" },
    { key: "attribution_provisoire", label: "Attribution provisoire" },
    { key: "attribution_definitive", label: "Attribution définitive" },
    { key: "recours_update", label: "Recours update" },
    { key: "systeme", label: "Système" },
];



export default function NotificationsPage() {
    
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: "1",
            category: "publication_ao",
            title: "Nouveau Appel d'Offres : Modernisation IT",
            description: "Un nouvel appel d'offres correspondant à votre secteur a été publié par le Ministère de l'Énergie.",
            time: "Il y a 2h",
            read: false,
        },
        {
            id: "2",
            category: "depot_confirme",
            title: "Dépôt confirmé : Réf #AO-2024-089",
            description: "Votre dossier pour le projet de maintenance des infrastructures a été reçu avec succès.",
            time: "Hier, 14:20",
            read: false,
        },
        {
            id: "3",
            category: "ouverture_plis",
            title: "Ouverture des plis imminente",
            description: "La séance d'ouverture des plis pour le marché public n°45/2023 débutera dans 30 minutes.",
            time: "Hier, 09:15",
            read: false,
        },
        {
            id: "4",
            category: "attribution_provisoire",
            title: "Attribution Provisoire Publiée",
            description: "Les résultats de l'attribution provisoire pour le projet 'Smart City' sont désormais disponibles.",
            time: "3 oct. 2024",
            read: true,
        },
        {
            id: "5",
            category: "recours_update",
            title: "Mise à jour Recours",
            description: "Un recours a été déposé concernant l'AO #990-B. Consultez les détails de la procédure.",
            time: "2 oct. 2024",
            read: true,
        },
        {
            id: "6",
            category: "systeme",
            title: "Maintenance du Système",
            description: "Le portail Al-Mizan sera indisponible ce dimanche de 02h à 04h pour une mise à jour technique.",
            time: "30 sept. 2024",
            read: true,
        },
    ]);

    const [activeCategory, setActiveCategory] = useState<NotificationCategory>("all");
    const [unreadOnly, setUnreadOnly] = useState(false);

    // ── API HANDLERS (wire up when backend is ready) ──────────────────

    const handleMarkRead = (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/read`, { method: "PATCH" }).catch(() => {});
    };

    const handleMarkAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`, { method: "PATCH" }).catch(() => {});
    };

    // ── FILTERS ───────────────────────────────────────────────────────

    const filtered = notifications.filter((n) => {
        const categoryMatch = activeCategory === "all" || n.category === activeCategory;
        const unreadMatch = !unreadOnly || !n.read;
        return categoryMatch && unreadMatch;
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f1f5f9" }}>
            <div className="max-w-4xl mx-auto p-6 space-y-5">

                 
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Gérez vos alertes et mises à jour de marchés</p>
                    </div>
                    <button
                        onClick={handleMarkAllRead}
                        disabled={unreadCount === 0}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                        style={{ backgroundColor: "#4CAF50", color: "#fff" }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Marquer tout comme lu
                    </button>
                </div>

                {/* Filter row */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                        </svg>
                        <span className="text-sm text-gray-500 font-medium">Filtrer par catégorie</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Non lus seulement</span>
                        <button
                            onClick={() => setUnreadOnly(!unreadOnly)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${unreadOnly ? "bg-[#4CAF50]" : "bg-gray-200"}`}
                        >
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${unreadOnly ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                    </div>
                </div>

                {/* Category tabs */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                activeCategory === cat.key
                                    ? "text-white"
                                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                            style={activeCategory === cat.key ? { backgroundColor: "#1e2535" } : {}}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-sm">Aucune notification</p>
                        </div>
                    ) : (
                        filtered.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onMarkRead={handleMarkRead}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}