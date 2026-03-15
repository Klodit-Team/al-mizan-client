"use client";
import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { type Locale } from "@/i18n/config";
import type { getAuthDictionary } from "@/i18n/get-dictionaries";

type AuthDict = Awaited<ReturnType<typeof getAuthDictionary>>;

interface SetNewPasswordFormProps {

    dict: AuthDict["setNewPassword"];
}

const CODE_LENGTH = 6;

function getPasswordStrength(password: string): { label: string; width: string; color: string } {
    if (password.length === 0) return { label: "", width: "0%", color: "#e5e7eb" };
    if (password.length < 6) return { label: "Weak", width: "25%", color: "#ef4444" };
    if (password.length < 10) return { label: "Medium strength", width: "60%", color: "#f59e0b" };
    return { label: "Strong", width: "100%", color: "#4CAF50" };
}

export default function SetNewPasswordForm({ dict }: SetNewPasswordFormProps) {
    const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();
    const params = useParams();
    const locale = (params?.locale as Locale) || "fr";
    const strength = getPasswordStrength(password);

    const handleCodeChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);
        if (value && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
    };

    const handleSubmit = async () => {
        if (password !== confirmPassword || code.join("").length < CODE_LENGTH) return;
        setIsSubmitting(true);
        /*
        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: code.join(""),
                    password: password,
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Password reset failed");
            }
            
            router.push(`/${locale}/auth/login`);
        } catch (error) {
            console.error("Reset password error:", error);
            
        }
        */
        await new Promise((r) => setTimeout(r, 1000));
        setIsSubmitting(false);
        router.push(`/${locale}/auth/login`);
    };

    return (
        <div className="w-full lg:max-w-2xl max-w-xl bg-white rounded-2xl shadow-lg overflow-hidden mx-auto">
            {/* Top banner */}
            <div className="bg-white mb-4 px-6 pt-8 pb-14 flex flex-col items-center text-center relative">
                <div className="w-14 h-14 rounded-full bg-[#364150]/10 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-[#364150]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-[#364150]">{dict.title}</h1>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-xs">{dict.subtitle}</p>
            </div>

            {/* Form */}
            <div className="px-6 -mt-6 pb-6 space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">

                    {/* Recovery Code OTP */}
                    <div className="flex flex-col items-center" >
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                            {dict.recoveryCode}
                        </label>
                        <div className="flex gap-2 items-center">
                            {code.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { inputRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleCodeChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className={`w-10 h-11 text-center text-gray-500 text-base font-bold rounded-xl border-2 outline-none transition-all
                                        ${digit ? "border-[#4CAF50] bg-green-50" : "border-gray-200"}
                                        focus:border-[#4CAF50] focus:ring-2 focus:ring-green-100`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                            {dict.newPassword}
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] text-gray-700 transition-all"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPassword ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" /></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>
                        {/* Strength bar */}
                        {password.length > 0 && (
                            <div className="mt-2">
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-300" style={{ width: strength.width, backgroundColor: strength.color }} />
                                </div>
                                <p className="text-xs mt-1 text-right" style={{ color: strength.color }}>{strength.label}</p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                            {dict.confirmPassword}
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            <input
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm outline-none focus:ring-2 transition-all
                                    ${confirmPassword && password !== confirmPassword ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"}`}
                            />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showConfirm ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" /></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{dict.passwordMismatch}</p>
                        )}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || password !== confirmPassword || code.join("").length < CODE_LENGTH}
                        className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                        style={{ backgroundColor: "#4CAF50", color: "#fff" }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {isSubmitting ? dict.saving : dict.saveButton}
                    </button>
                </div>


                <p className="text-center text-xs text-gray-400 uppercase tracking-widest">{dict.ministere}</p>
            </div>
        </div>
    );
}