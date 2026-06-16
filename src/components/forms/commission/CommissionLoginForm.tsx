"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

import { type Locale } from "@/i18n/config";
import { useLoginMutation } from "@/services/auth/queries";
import { getCurrentUser } from "@/services/auth/api";
import { ApiClientError } from "@/services/client";
import { mapRoleToDashboardUserType, getDashboardHomePath } from "@/lib/auth/userType";
import { useCommissionUserId } from "@/hooks/useCommissionUserId";

import type { getAuthDictionary } from "@/i18n/get-dictionaries";

type AuthDict = Awaited<ReturnType<typeof getAuthDictionary>>;

interface CommissionLoginFormProps {
  dict: AuthDict["commissionLogin"];
  locale: Locale;
}

function setUserTypeCookie(value: string | null) {
  if (typeof document === "undefined") return;
  if (!value) {
    document.cookie = "user_type=; Path=/; Max-Age=0; SameSite=Lax";
    return;
  }
  document.cookie = `user_type=${value}; Path=/; Max-Age=604800; SameSite=Lax`;
}

export default function CommissionLoginForm({ dict, locale }: CommissionLoginFormProps) {
  const params = useParams();
  const resolvedLocale = (params?.locale as Locale) ?? locale ?? "fr";
  const router = useRouter();

  const [apiError, setApiError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLoginMutation();
  const { setCommissionUserId } = useCommissionUserId();

  const loginSchema = z.object({
    email: z.string().email(dict.errors.invalidEmail),
    password: z.string().min(8, dict.errors.passwordMin),
    rememberMe: z.boolean().optional(),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

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

      let userType =
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
          // Ignore: handled below.
        }
      }

      if (userType !== "commission") {
        setApiError(dict.errors.roleNotCommission);
        return;
      }

      if (!userId) {
        setApiError(dict.errors.genericError);
        return;
      }

      setUserTypeCookie("commission");
      setCommissionUserId(userId);

      router.push(getDashboardHomePath(resolvedLocale, "commission", userId));
    } catch (error) {
      if (error instanceof ApiClientError) {
        const attemptsRemaining = Number(error.payload?.attemptsRemaining ?? NaN);
        if (Number.isFinite(attemptsRemaining)) {
          setAttemptCount(Math.max(0, 5 - attemptsRemaining));
        }

        if (error.status === 429) {
          router.push(`/${resolvedLocale}/auth/login/account-lock`);
          return;
        }

        setApiError(error.message);
        return;
      }

      const newCount = attemptCount + 1;
      setAttemptCount(newCount);
      if (newCount >= 5) {
        router.push(`/${resolvedLocale}/auth/login/account-lock`);
        return;
      }
      setApiError(dict.errors.genericError);
    }
  };

  const isLoading = isSubmitting || loginMutation.isPending;

  return (
    <div className="w-full">

      {/* Header */}
      <div className="mb-7">
        {/* Badge vert */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-5"
          style={{ backgroundColor: "rgba(76, 175, 80, 0.08)", border: "1px solid rgba(76, 175, 80, 0.25)" }}
        >
          <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "#4CAF50" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#2e7d32" }}>
            {dict.badge}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{dict.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{dict.subtitle}</p>
      </div>

      {/* Notice d'accès */}
      <div
        className="mb-6 flex items-start gap-2.5 px-3.5 py-3 rounded-xl"
        style={{ backgroundColor: "rgba(76, 175, 80, 0.06)", border: "1px solid rgba(76, 175, 80, 0.2)" }}
      >
        <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#4CAF50" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p className="text-xs leading-relaxed" style={{ color: "#2e7d32" }}>
          {dict.accessNotice}
        </p>
      </div>

      {/* Formulaire */}
      <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {dict.email}
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder={dict.emailPlaceholder}
            disabled={isLoading}
            className={`text-gray-700 w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 ${
              errors.email
                ? "border-red-400 focus:ring-red-100"
                : "border-gray-200 focus:ring-green-100 focus:border-[#4CAF50]"
            }`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {dict.password}
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder={dict.passwordPlaceholder}
              disabled={isLoading}
              className={`text-gray-700 w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 pr-11 ${
                errors.password
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
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {/* Se souvenir de moi + Mot de passe oublié (même ligne — cohérent avec LoginForm) */}
        <div className="flex items-center gap-2">
          <input
            {...register("rememberMe")}
            type="checkbox"
            id="rememberMe-commission"
            className="w-4 h-4 rounded border-gray-300 accent-[#4CAF50] cursor-pointer"
          />
          <label htmlFor="rememberMe-commission" className="text-sm text-gray-600 cursor-pointer select-none">
            {dict.rememberMe}
          </label>
          <a
            href={`/${resolvedLocale}/auth/reset-password`}
            className="text-xs font-semibold ml-auto hover:underline"
            style={{ color: "#364150" }}
          >
            {dict.forgotPassword}
          </a>
        </div>

        {/* Erreur API */}
        {apiError && (
          <div className="flex items-start gap-2 px-3.5 py-3 rounded-xl" style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
            <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-600">{apiError}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={{ backgroundColor: "#4CAF50" }}
        >
          {isLoading ? dict.submitting : dict.submit}
        </button>
      </form>

      <div className="mt-5 text-center">
        <Link
          href={`/${resolvedLocale}/auth/login`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:bg-gray-100"
            style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </span>
          {dict.backToLogin}
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center leading-relaxed">{dict.footerNote}</p>
      </div>
    </div>
  );
}