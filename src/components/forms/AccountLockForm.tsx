"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { type Locale } from "@/i18n/config";
import type { getAuthDictionary } from "@/i18n/get-dictionaries";
import { useParams } from "next/navigation";

type AuthDict = Awaited<ReturnType<typeof getAuthDictionary>>;

interface AccountLockedFormProps {
    dict: AuthDict["accountLocked"];
    lockDurationSeconds?: number;
}

export default function AccountLockedForm({ dict, lockDurationSeconds = 899 }: AccountLockedFormProps) {
    const [timeLeft, setTimeLeft] = useState(lockDurationSeconds);
    const params = useParams();
    const locale = (params?.locale as Locale) || "fr";
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    return (
        <div className="w-full lg:max-w-2xl max-w-xl bg-white rounded-2xl shadow-lg overflow-hidden mx-auto">
            {/* Top banner */}
            <div className="bg-white mb-4 px-16 pt-8 pb-14 flex flex-col items-center text-center relative">
                <div className="w-14 h-14 rounded-full bg-[#364150]/10 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-[#364150]">{dict.title}</h1>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-xs">{dict.subtitle}</p>
            </div>

            {/* Content */}
            <div className="px-6 -mt-6 pb-6 space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">

                    {/* Timer */}
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                        <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-red-600 font-medium">
                            {dict.tryAgain}{" "}
                            <span className="font-bold">{formatTime(timeLeft)}</span>
                        </p>
                    </div>

                    {/* Reset via email */}
                    <Link
                        href={`/${locale}/auth/reset-password`}
                        className="w-full py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{ backgroundColor: "#1e2535", color: "#fff" }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                        </svg>
                        {dict.resetButton}
                    </Link>

                    {/* Contact support */}
                    <Link
                        href={`/${locale}/support`}
                        className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-gray-200 text-gray-600 transition-all hover:bg-gray-50 active:scale-[0.98]"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {dict.contactSupport}
                    </Link>
                </div>

                
                <p className="text-center text-xs text-gray-400 uppercase tracking-widest">{dict.ministere}</p>
            </div>
        </div>
    );
}