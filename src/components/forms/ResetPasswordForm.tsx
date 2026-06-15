"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { type Locale } from "@/i18n/config";
import type { getAuthDictionary } from "@/i18n/get-dictionaries";

type AuthDict = Awaited<ReturnType<typeof getAuthDictionary>>;

interface ResetPasswordFormProps {
    dict: AuthDict["resetPassword"];
}

export default function ResetPasswordForm({ dict }: ResetPasswordFormProps) {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
      const params = useParams();
     const locale = (params?.locale as Locale) || "fr";
    const router = useRouter();

    const handleSubmit = async () => {
        if (!email) return;
        setIsSubmitting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Reset password error:", errorData.message || "Request failed");
            }
        } catch (error) {
            console.error("Reset password error:", error);
        }
        setIsSubmitting(false);
        router.push(`/${locale}/auth/reset-password/set-new-password`);
    };

    return (
        <div className="w-full lg:max-w-2xl max-w-xl bg-white rounded-2xl shadow-lg overflow-hidden mx-auto">
            {/* Top banner */}
            <div className="bg-white mb-4 px-6 pt-8 pb-14 flex flex-col items-center text-center relative">
                <div className="w-14 h-14 rounded-full bg-[#364150]/10 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-[#364150]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-[#364150]">{dict.title}</h1>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-xs">{dict.subtitle}</p>
            </div>

            {/* Form */}
            <div className="px-6 -mt-6 pb-6 space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                            {dict.emailLabel}
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={dict.emailPlaceholder}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] text-gray-700 placeholder:text-gray-400 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !email}
                        className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                        style={{ backgroundColor: "#4CAF50", color: "#fff" }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {isSubmitting ? dict.sending : dict.sendButton}
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500">
                    {dict.rememberedPassword}{" "}
                    <Link href={`/${locale}/auth/login`} className="font-semibold" style={{ color: "#4CAF50" }}>
                        {dict.signInLink}
                    </Link>
                </p>

                

                <p className="text-center text-xs text-gray-400 uppercase tracking-widest">{dict.ministere}</p>
            </div>
        </div>
    );
}