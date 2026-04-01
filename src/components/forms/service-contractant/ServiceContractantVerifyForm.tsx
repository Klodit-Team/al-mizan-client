"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Locale } from "@/i18n/config";
import { verifySchema } from "@/lib/validations/verifySchema";
import { verifyServiceContractantMfa } from "@/services/auth";

interface ServiceContractantVerifyDict {
  title: string;
  subtitle: string;
  codeLabel: string;
  lockoutWarning: string;
  verifying: string;
  verifyButton: string;
  backToLogin: string;
  errors: {
    incomplete: string;
    invalidCode: string;
  };
}

interface ServiceContractantVerifyFormProps {
  dict: ServiceContractantVerifyDict;
}

const CODE_LENGTH = 6;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WARNING_THRESHOLD = 3;

export default function ServiceContractantVerifyForm({
  dict,
}: ServiceContractantVerifyFormProps) {
  const params = useParams();
  const locale = (params?.locale as Locale) || "fr";
  const router = useRouter();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setFormError(null);

    // Auto focus next input
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
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    if (pasted.length === CODE_LENGTH) {
      setCode(pasted.split(""));
      setFormError(null);
      inputRefs.current[CODE_LENGTH - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    const validation = verifySchema.safeParse({ code: fullCode });

    if (!validation.success) {
      setFormError(dict.errors.incomplete);
      return;
    }

    setIsVerifying(true);
    setFormError(null);

    const result = await verifyServiceContractantMfa({ code: fullCode });

    if (!result.success) {
      const nextFailedAttempts =
        typeof result.attemptsRemaining === "number"
          ? Math.max(0, MAX_FAILED_ATTEMPTS - result.attemptsRemaining)
          : failedAttempts + 1;

      setFailedAttempts(nextFailedAttempts);

      if (
        result.errorCode === "LOCKED" ||
        nextFailedAttempts >= MAX_FAILED_ATTEMPTS
      ) {
        router.push(`/${locale}/auth/login/account-lock`);
        return;
      }

      setFormError(dict.errors.invalidCode);
      setIsVerifying(false);
      return;
    }

    // Proceed to dashboard on success
    router.push(`/${locale}/service-contractant/dashboard`);
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

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {dict.codeLabel}
          </label>
          <div
            className="flex justify-between gap-2"
            onPaste={handlePaste}
            dir="ltr"
          >
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={isVerifying}
                className={`w-12 h-14 text-center text-lg font-bold rounded-xl border outline-none transition-all
                                    ${digit ? "border-[#4CAF50] bg-green-50 text-gray-900" : "border-gray-200 text-gray-900"}
                                    ${formError ? "border-red-400 focus:ring-red-100" : "focus:border-[#4CAF50] focus:ring-2 focus:ring-green-100"}
                                    disabled:opacity-60
                                `}
              />
            ))}
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
          type="button"
          onClick={handleVerify}
          disabled={isVerifying || code.join("").length < CODE_LENGTH}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={{ backgroundColor: "#4CAF50" }}
        >
          {isVerifying ? dict.verifying : dict.verifyButton}
        </button>

        <div className="text-center mt-6">
          <Link
            href={`/${locale}/service-contractant/login`}
            className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← {dict.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  );
}
