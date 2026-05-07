"use client";
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Locale } from "@/i18n/config";
import type { getAuthDictionary } from "@/i18n/get-dictionaries";
import { mapRoleToDashboardUserType } from "@/lib/auth/userType";

const CODE_LENGTH = 6;

type AuthDict = Awaited<ReturnType<typeof getAuthDictionary>>;

interface VerifyFormProps {
    dict: AuthDict["verify"];
}

export default function VerifyForm({ dict }: VerifyFormProps) {
    const params = useParams();
    const router = useRouter();
    const locale = (params?.locale as Locale) || "fr";
    const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
    const [timeLeft, setTimeLeft] = useState(119);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer
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

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value.slice(-1); // only last char
        setCode(newCode);
        setError("");
        // Move to next input
        if (value && index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
        if (pasted.length === CODE_LENGTH) {
            setCode(pasted.split(""));
            inputRefs.current[CODE_LENGTH - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const fullCode = code.join("");
        if (fullCode.length < CODE_LENGTH) {
            setError(dict.errors.incomplete);
            return;
        }
        setIsVerifying(true);
        setError("");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/mfa/verify`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: fullCode }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Verification failed");
            }

            const result = await response.json();
            const effectiveRole = result.role || result.user?.role || result.user?.userType;
            const resolvedUserType = mapRoleToDashboardUserType(effectiveRole);
            const routeUserId = result.user?.userId || result.userId || result.id || result.user?.id;

            if (resolvedUserType === "admin") {
                const adminId = routeUserId || "admin";
                router.push(`/${locale}/dashboard/admin/${adminId}/tableau-de-bord`);
            } else if (resolvedUserType === "operateur") {
                router.push(`/${locale}/dashboard/operateur/tableau-de-bord`);
            } else if (resolvedUserType === "contractant") {
                router.push(`/${locale}/dashboard/contractant/tableau-de-bord`);
            } else {
                router.push(`/${locale}/dashboard`);
            }

        } catch (error: any) {
            console.error("Verification error:", error);
            setError(error.message || "Verification failed");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-mfa`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to resend code");
            }

            setTimeLeft(119);
            setCode(Array(CODE_LENGTH).fill(""));
            setError("");
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            console.error("Resend error:", error);
            setError(error.message || "Failed to resend code");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center">
                {/* Icon */}
                <div className="flex justify-center mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                        <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900">{dict.title}</h2>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    {dict.subtitle}
                </p>

                {/* OTP Inputs */}
                <div className="flex justify-center gap-2.5 mt-7" onPaste={handlePaste}>
                    {code.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => { inputRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            className={`w-11 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all
                ${digit ? "border-[#4CAF50] bg-green-50 text-gray-900" : "border-gray-200 text-gray-900"}
                ${error ? "border-red-400" : ""}
                focus:border-[#4CAF50] focus:ring-2 focus:ring-green-100
              `}
                        />
                    ))}
                </div>

                {/* Error */}
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

                {/* Timer */}
                <div className="flex items-center justify-center gap-1.5 mt-4 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                        {dict.expiry}{" "}
                        <span className={`font-semibold ${timeLeft <= 30 ? "text-red-500" : "text-gray-700"}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </span>
                </div>

                {/* Verify Button */}
                <button
                    onClick={handleVerify}
                    disabled={isVerifying || code.join("").length < CODE_LENGTH}
                    className="mt-5 w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                    style={{ backgroundColor: "#4CAF50" }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {isVerifying ? dict.verifying : dict.verify}
                </button>

                {/* Resend */}
                <div className="mt-4">
                    <p className="text-xs text-gray-400">{dict.noCode}</p>
                    <button
                        onClick={handleResend}
                        disabled={timeLeft > 0}
                        className="text-sm font-semibold mt-0.5 transition-colors disabled:text-gray-300"
                        style={{ color: timeLeft <= 0 ? "#4CAF50" : undefined }}
                    >
                        {dict.resend}
                    </button>
                </div>
            </div>
        </div>
    );
}