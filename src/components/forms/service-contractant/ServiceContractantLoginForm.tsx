"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Locale } from "@/i18n/config";
import {
  serviceContractantLoginSchema,
  type ServiceContractantLoginFormData,
} from "@/lib/validations/serviceContractantLoginSchema";
import { loginServiceContractant } from "@/services/auth";
import LoginField from "./LoginField";
import PasswordField from "./PasswordField";

interface ServiceContractantLoginDict {
  title: string;
  subtitle: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  forgotPassword: string;
  submit: string;
  submitting: string;
  lockoutWarning: string;
  errors: {
    invalidEmail: string;
    passwordRequired: string;
    accountLocked: string;
    invalidCredentials: string;
    genericError: string;
  };
}

interface ServiceContractantLoginFormProps {
  dict: ServiceContractantLoginDict;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WARNING_THRESHOLD = 3;

export default function ServiceContractantLoginForm({
  dict,
}: ServiceContractantLoginFormProps) {
  const params = useParams();
  const locale = (params?.locale as Locale) || "fr";
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceContractantLoginFormData>({
    resolver: zodResolver(serviceContractantLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: ServiceContractantLoginFormData) => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      const result = await loginServiceContractant(data);

      if (!result.success) {
        if (result.errorCode === "LOCKED") {
          setFormError(dict.errors.accountLocked);
          router.push(`/${locale}/auth/login/account-lock`);
          return;
        }

        const nextFailedAttempts = failedAttempts + 1;
        setFailedAttempts(nextFailedAttempts);
        setFormError(dict.errors.invalidCredentials);

        if (nextFailedAttempts >= MAX_FAILED_ATTEMPTS) {
          router.push(`/${locale}/auth/login/account-lock`);
        }

        return;
      }

      if (result.requiresMfa) {
        router.push(`/${locale}/service-contractant/verify`);
        return;
      }

      router.push(`/${locale}/service-contractant/dashboard`);
    } catch {
      setFormError(dict.errors.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLockoutWarning =
    failedAttempts >= LOCKOUT_WARNING_THRESHOLD &&
    failedAttempts < MAX_FAILED_ATTEMPTS;

  return (
    <div className="w-full max-w-md bg-white p-8">
      <div className="mb-8 text-left">
        <h1 className="text-2xl font-bold text-gray-900">{dict.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{dict.subtitle}</p>
      </div>

      <form method="post" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <LoginField
          label={dict.email}
          placeholder={dict.emailPlaceholder}
          registration={register("email")}
          error={errors.email ? dict.errors.invalidEmail : undefined}
          disabled={isSubmitting}
        />

        <div>
          <PasswordField
            label={dict.password}
            placeholder={dict.passwordPlaceholder}
            registration={register("password")}
            error={errors.password ? dict.errors.passwordRequired : undefined}
            disabled={isSubmitting}
          />
          <div className="mt-1 text-right">
            <Link
              href={`/${locale}/auth/reset-password`}
              className="text-xs font-semibold"
              style={{ color: "#364150" }}
            >
              {dict.forgotPassword}
            </Link>
          </div>
        </div>

        {formError ? <p className="text-red-500 text-xs">{formError}</p> : null}

        {showLockoutWarning ? (
          <p className="text-amber-600 text-xs font-medium">
            {dict.lockoutWarning.replace(
              "{count}",
              String(MAX_FAILED_ATTEMPTS - failedAttempts),
            )}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={{ backgroundColor: "#4CAF50" }}
        >
          {isSubmitting ? dict.submitting : dict.submit}
        </button>
      </form>
    </div>
  );
}
