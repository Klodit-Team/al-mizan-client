"use client";

import { type Notification, type NotificationCategory } from "@/components/dashboard/admin/notif/Notificationspage";
import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

const categoryStyles: Record<string, { color: string; bg: string; dot: string; icon: React.ReactNode }> = {
    publication_ao: {
        color: "text-blue-600",
        bg: "bg-blue-50",
        dot: "bg-blue-500",
        icon: (
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
            </div>
        ),
    },
    depot_confirme: {
        color: "text-green-600",
        bg: "bg-green-50",
        dot: "bg-green-500",
        icon: (
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        ),
    },
    ouverture_plis: {
        color: "text-purple-600",
        bg: "bg-purple-50",
        dot: "bg-purple-500",
        icon: (
            <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
            </div>
        ),
    },
    evaluation_resultat: {
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        dot: "bg-yellow-500",
        icon: (
            <div className="w-9 h-9 rounded-full bg-yellow-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            </div>
        ),
    },
    attribution_provisoire: {
        color: "text-orange-600",
        bg: "bg-orange-50",
        dot: "bg-orange-500",
        icon: (
            <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            </div>
        ),
    },
    attribution_definitive: {
        color: "text-green-700",
        bg: "bg-green-50",
        dot: "bg-green-700",
        icon: (
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
        ),
    },
    recours_update: {
        color: "text-red-600",
        bg: "bg-red-50",
        dot: "bg-red-500",
        icon: (
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
        ),
    },
    systeme: {
        color: "text-gray-600",
        bg: "bg-gray-100",
        dot: "bg-gray-400",
        icon: (
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
        ),
    },
};

interface NotificationCardProps {
    notification: Notification;
    onMarkRead: (id: string) => void;
    dict: CommonDict["dashboard"]["admin"]["notificationsPage"];
}

export default function NotificationCard({ notification, onMarkRead, dict }: NotificationCardProps) {
    const style = categoryStyles[notification.category];
    const categoryLabel = dict.categories[notification.category] || "Notification";

    return (
        <div
            className={`flex items-start gap-4 px-5 py-4 border-b border-gray-100 transition-colors cursor-pointer hover:bg-gray-50 ${!notification.read ? "border-l-4 border-l-[#4CAF50]" : "border-l-4 border-l-transparent"}`}
            onClick={() => onMarkRead(notification.id)}
        >
            {style.icon}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <p className={`text-sm font-semibold ${notification.read ? "text-gray-600" : "text-gray-800"}`}>
                        {notification.title}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{notification.time}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{notification.description}</p>
                <div className="mt-2 flex items-center gap-1.5">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.color}`}>
                        {categoryLabel}
                    </span>
                    {!notification.read && (
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    )}
                </div>
            </div>
        </div>
    );
}