"use client"
import { useState, useEffect } from "react";
import NotificationCard from "@/components/dashboard/admin/NotificationCard";
import type { getDictionary } from "@/i18n/get-dictionaries";
import {
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  type NotificationCategory,
} from "@/services/admin/notifications";

export type FilterCategory = NotificationCategory | "all";

export interface Notification {
    id: string;
    category: NotificationCategory;
    title: string;
    description: string;
    time: string;
    read: boolean;
}

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface NotificationsPageProps {
    dict: CommonDict["dashboard"]["admin"]["notificationsPage"];
}

export default function NotificationsPageClient({ dict }: NotificationsPageProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
    const [unreadOnly, setUnreadOnly] = useState(false);

    useEffect(() => {
        const loadNotifications = async () => {
            setIsLoading(true);
            setFetchError(null);

            try {
                const data = await getAdminNotifications();
                setNotifications(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching notifications:", error);
                setFetchError("Impossible de charger les notifications.");
            } finally {
                setIsLoading(false);
            }
        };

        loadNotifications();
    }, []);

    const handleMarkRead = async (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

        try {
            await markAdminNotificationRead(id);
        } catch (error) {
            console.error("Error marking notification read:", error);
        }
    };

    const handleMarkAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

        try {
            await markAllAdminNotificationsRead();
        } catch (error) {
            console.error("Error marking all notifications read:", error);
        }
    };

    // ── FILTERS ───────────────────────────────────────────────────────

    const filtered = notifications.filter((n) => {
        const categoryMatch = activeCategory === "all" || n.category === activeCategory;
        const unreadMatch = !unreadOnly || !n.read;
        return categoryMatch && unreadMatch;
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    const categoriesList: { key: FilterCategory; label: string }[] = [
        { key: "all", label: dict.categories.all },
        { key: "publication_ao", label: dict.categories.publication_ao },
        { key: "depot_confirme", label: dict.categories.depot_confirme },
        { key: "ouverture_plis", label: dict.categories.ouverture_plis },
        { key: "evaluation_resultat", label: dict.categories.evaluation_resultat },
        { key: "attribution_provisoire", label: dict.categories.attribution_provisoire },
        { key: "attribution_definitive", label: dict.categories.attribution_definitive },
        { key: "recours_update", label: dict.categories.recours_update },
        { key: "systeme", label: dict.categories.systeme },
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#f1f5f9" }}>
            <div className="max-w-4xl mx-auto p-6 space-y-5">

                 
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{dict.title}</h1>
                        <p className="text-sm text-gray-400 mt-0.5">{dict.subtitle}</p>
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
                        {dict.markAllAsRead}
                    </button>
                </div>

                {/* Filter row */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                        </svg>
                        <span className="text-sm text-gray-500 font-medium">{dict.filterByCategory}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{dict.unreadOnly}</span>
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
                    {categoriesList.map((cat) => (
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
                            <p className="text-sm">{dict.noNotifications}</p>
                        </div>
                    ) : (
                        filtered.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onMarkRead={handleMarkRead}
                                dict={dict}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
