"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { type Locale } from "@/i18n/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginFormData } from "@/lib/validations/loginSchema";
import { useLoginMutation } from "@/services/auth/queries";
import { ApiClientError } from "@/services/client";
import { getCurrentUser } from "@/services/auth/api";
import {
    getDashboardHomePath,
    mapRoleToDashboardUserType,
    type DashboardUserType,
} from "@/lib/auth/userType";

import type { getAuthDictionary } from "@/i18n/get-dictionaries";

type AuthDict = Awaited<ReturnType<typeof getAuthDictionary>>;

interface LoginFormProps {
    dict: AuthDict["login"];
}

export default function LoginForm({ dict }: LoginFormProps) {
    const params = useParams();
    const locale = (params?.locale as Locale) || "fr";
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [attempCount, setAttempCount] = useState(0);
    const [apiError, setApiError] = useState<string | null>(null);
    const loginMutation = useLoginMutation();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setApiError(null);
        try {
            const loginResponse = await loginMutation.mutateAsync({
                email: data.email,
                password: data.password,
            });

            console.log("Login API Response:", loginResponse);

            let userType: DashboardUserType | null =
                mapRoleToDashboardUserType(loginResponse.userType) ||
                mapRoleToDashboardUserType(loginResponse.role) ||
                mapRoleToDashboardUserType(loginResponse.user?.userType) ||
                mapRoleToDashboardUserType(loginResponse.user?.role);

            let userId = loginResponse.userId || loginResponse.user?.userId;

            if (!userType || !userId) {
                try {
                    const meResponse = await getCurrentUser();
                    userType =
                        userType ||
                        mapRoleToDashboardUserType(meResponse.user?.userType) ||
                        mapRoleToDashboardUserType(meResponse.user?.role);
                    userId = userId || meResponse.user?.userId;
                } catch {
                    // Ignore role resolution failure and handle below.
                }
            }

            if (!userType) {
                document.cookie = "user_type=; Path=/; Max-Age=0; SameSite=Lax";
                setApiError("Unable to resolve your account role. Please try again.");
                return;
            }

            const resolvedUserType: DashboardUserType = userType;
            document.cookie = `user_type=${resolvedUserType}; Path=/; Max-Age=604800; SameSite=Lax`;

            router.push(getDashboardHomePath(locale, resolvedUserType, userId));
            return;
        } catch (error) {
            if (error instanceof ApiClientError) {
                const attemptsRemaining = Number(error.payload?.attemptsRemaining ?? NaN);
                if (Number.isFinite(attemptsRemaining)) {
                    setAttempCount(Math.max(0, 5 - attemptsRemaining));
                }

                if (error.status === 429) {
                    router.push(`/${locale}/auth/login/account-lock`);
                    return;
                }

                setApiError(error.message);
                return;
            }

            setApiError("Login failed. Please try again.");
        }

        const newAttemptCount = attempCount + 1;
        setAttempCount(newAttemptCount);
        if (newAttemptCount >= 5) {
            router.push(`/${locale}/auth/login/account-lock`);
        }
    };

    return (
        <div className="w-full max-w-md bg-white  p-8">
            <div className="mb-8 text-center">

                <h1 className="text-2xl font-bold text-gray-900 text-left">{dict.title}</h1>
                <p className="text-sm text-gray-500 mt-1 text-left">{dict.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {dict.email}
                    </label>
                    <input
                        {...register("email")}
                        type="email"
                        placeholder="you@example.com"
                        className={`text-[#94A3B8] w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 ${errors.email
                            ? "border-red-400 focus:ring-red-100"
                            : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"
                            }`}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                </div>


                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">{dict.password}</label>

                    </div>
                    <div className="relative">
                        <input
                            {...register("password")}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`text-[#94A3B8] text-bold w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 pr-11 ${errors.password
                                ? "border-red-400 focus:ring-red-100"
                                : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? (

                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (

                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>

                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                    )}
                </div>


                <div className="flex items-center gap-2">
                    <input
                        {...register("rememberMe")}
                        type="checkbox"
                        id="rememberMe"
                        className="w-4 h-4 rounded border-gray-300 accent-[#4CAF50] cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer select-none">
                        {dict.rememberMe}
                    </label>
                    <a href={`/${locale}/auth/reset-password`} className="text-xs font-semibold ml-auto" style={{ color: "#364150" }}>
                        {dict.forgotPassword}
                    </a>
                </div>


                <button
                    type="submit"
                    disabled={isSubmitting || loginMutation.isPending}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                    style={{ backgroundColor: "#4CAF50" }}
                >
                    {isSubmitting || loginMutation.isPending ? dict.submitting : dict.submit}
                </button>

                {apiError && (
                    <p className="text-red-500 text-sm">{apiError}</p>
                )}
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                {dict.noAccount} {" "}
                <a href={`/${locale}/auth/register/operateur`} className="font-semibold" style={{ color: "#364150" }}>
                    {dict.createOne}
                </a>
            </p>
        </div>
    );
}