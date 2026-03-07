"use client";
import { useState } from "react";
import Link from "next/link";
import { type Locale } from "@/i18n/config";
import type { getAuthDictionary } from "@/i18n/get-dictionaries";

type AuthDict = Awaited<ReturnType<typeof getAuthDictionary>>;
interface RegistrationSuccessProps {
    locale: Locale;
    registrationId?: string;
    receiptHash?: string;
    dict: AuthDict["registerSuccess"];
}

export default function RegistrationSuccess({
    locale,
    registrationId = "ALM-2024-8881",
    receiptHash = "b98b44298fc13349ef5f4c998f392427a441a6490 904ca465901b78526655",
    dict,
}: RegistrationSuccessProps) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(receiptHash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden mx-auto">

            {/* Header + Progress */}
            <div className="w-full max-w-2xl">

                {/* Top success banner */}
                <div className="relative  bg-[#364150] px-6 pt-10 pb-16 mb-16 flex flex-col items-center text-center">
                    
                    {/* Success icon */}
                    <div className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#30E86E" }}>
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="relative z-10 text-xl font-bold text-white">{dict.title}</h1>
                    <p className="relative z-10 text-sm text-gray-400 mt-1">
                        {dict.registrationId}: <span className="text-gray-300 font-medium">{registrationId}</span>
                    </p>
                </div>

                {/* Content */}
                <div className="px-6 -mt-6 space-y-4 pb-6">

                    {/* Verification Status */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <h2 className="text-sm font-bold text-gray-800 mb-4">{dict.verificationStatus}</h2>

                        {/* AI Pre-Analysis */}
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800">{dict.aiPreAnalysis}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{dict.aiPreAnalysisDesc}</p>
                                <span
                                    className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                                    style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    {dict.compliant}
                                </span>
                            </div>
                        </div>

                        {/* Divider with line */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 flex justify-center">
                                <div className="w-0.5 h-5 bg-gray-200 mx-auto" />
                            </div>
                            <div />
                        </div>

                        {/* Legal Review */}
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800">{dict.legalReview}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{dict.legalReviewDesc}</p>
                                {/* Progress bar */}
                                <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{ width: "45%", backgroundColor: "#30E86E" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Receipt */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold text-gray-800">{dict.securityReceipt}</h2>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 flex items-start justify-between gap-2">
                            <p className="text-xs text-gray-500 font-mono leading-relaxed break-all">
                                {receiptHash}
                            </p>
                            <button
                                onClick={handleCopy}
                                className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
                                title="Copy hash"
                            >
                                {copied ? (
                                    <svg className="w-4 h-4 text-[#30E86E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Return to Dashboard button */}
                    <Link
                        href={`/${locale}/`}
                        className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{ backgroundColor: "#30E86E", color: "#0F172A" }}
                    >
                        {dict.returnToDashboard}
                    </Link>

                    {/* Legal notice */}
                    <p className="text-xs text-center text-gray-400 leading-relaxed">
                        {dict.termsText}
                        <Link href={`/${locale}/terms`} className="underline hover:text-gray-600">
                            {dict.termsLink}
                        </Link>{" "}
                        {dict.termsEnd}
                    </p>
                </div>
            </div>
        </div>
    );
}