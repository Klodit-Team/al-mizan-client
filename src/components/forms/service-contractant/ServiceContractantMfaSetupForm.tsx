"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Locale } from "@/i18n/config";
import { verifySchema } from "@/lib/validations/verifySchema";
import {
  enableServiceContractantMfa,
  getServiceContractantMfaSetup,
} from "@/services/auth";
import MfaQrPreview from "./MfaQrPreview";
import VerificationCodeInput from "./VerificationCodeInput";

interface ServiceContractantMfaSetupDict {
  title: string;
  subtitle: string;
  scanSectionTitle: string;
  scanHelp: string;
  manualKeyLabel: string;
  copySuccess: string;
  copy: string;
  manualKeyHelp: string;
  verificationSectionTitle: string;
  verificationLabel: string;
  enabling: string;
  enableButton: string;
  skipButton: string;
  securityNoteEncrypted: string;
  securityNoteRecovery: string;
  errors: {
    genericError: string;
    incomplete: string;
    invalidCode: string;
  };
}

interface ServiceContractantMfaSetupFormProps {
  dict: ServiceContractantMfaSetupDict;
}

const CODE_LENGTH = 6;

export default function ServiceContractantMfaSetupForm({
  dict,
}: ServiceContractantMfaSetupFormProps) {
  const params = useParams();
  const locale = (params?.locale as Locale) || "fr";
  const router = useRouter();

  const [isLoadingSetup, setIsLoadingSetup] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualEntryKey, setManualEntryKey] = useState("");
  const [qrCodeSeed, setQrCodeSeed] = useState("");
  const [canSkip, setCanSkip] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const loadSetup = async () => {
      try {
        const setupData = await getServiceContractantMfaSetup();

        if (!alive) {
          return;
        }

        setManualEntryKey(setupData.manualEntryKey);
        setQrCodeSeed(setupData.qrCodeSeed);
        setCanSkip(setupData.canSkip);
      } catch {
        if (alive) {
          setFormError(dict.errors.genericError);
        }
      } finally {
        if (alive) {
          setIsLoadingSetup(false);
        }
      }
    };

    loadSetup();

    return () => {
      alive = false;
    };
  }, [dict.errors.genericError]);

  const fullCode = useMemo(() => code.join(""), [code]);

  const handleCodeChange = (nextCode: string[]) => {
    setCode(nextCode);
    setFormError(null);
  };

  const handleCopyManualKey = async () => {
    try {
      await navigator.clipboard.writeText(manualEntryKey);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1400);
    } catch {
      setCopySuccess(false);
    }
  };

  const handleEnableMfa = async () => {
    const validation = verifySchema.safeParse({ code: fullCode });

    if (!validation.success) {
      setFormError(dict.errors.incomplete);
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const result = await enableServiceContractantMfa({ code: fullCode });

      if (!result.success) {
        setFormError(dict.errors.invalidCode);
        return;
      }

      router.push(`/${locale}/service-contractant/dashboard`);
    } catch {
      setFormError(dict.errors.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push(`/${locale}/service-contractant/dashboard`);
  };

  return (
    <div className="w-full max-w-md bg-white p-8">
      <div className="mb-6 text-left">
        <h1 className="text-2xl font-bold text-gray-900">{dict.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{dict.subtitle}</p>
      </div>

      <div className="space-y-5">
        <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h2 className="text-sm font-semibold text-gray-900">
            {dict.scanSectionTitle}
          </h2>
          <p className="mt-1 text-xs text-gray-500">{dict.scanHelp}</p>

          <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-4">
            {isLoadingSetup ? (
              <div className="h-32 w-32 animate-pulse rounded-lg bg-gray-200" />
            ) : (
              <MfaQrPreview seed={qrCodeSeed} />
            )}
          </div>

          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {dict.manualKeyLabel}
                </p>
                <p className="mt-1 text-sm font-bold tracking-[0.18em] text-[#364150]">
                  {isLoadingSetup ? "---- ---- ---- ----" : manualEntryKey}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyManualKey}
                disabled={isLoadingSetup || !manualEntryKey}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                {copySuccess ? dict.copySuccess : dict.copy}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-500">
              {dict.manualKeyHelp}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-900">
            {dict.verificationSectionTitle}
          </h2>
          <label className="mt-2 mb-2 block text-sm font-medium text-gray-700">
            {dict.verificationLabel}
          </label>

          <VerificationCodeInput
            code={code}
            onChange={handleCodeChange}
            disabled={isLoadingSetup || isSubmitting}
            hasError={Boolean(formError)}
          />
        </section>

        {formError ? <p className="text-red-500 text-xs">{formError}</p> : null}

        <button
          type="button"
          onClick={handleEnableMfa}
          disabled={
            isLoadingSetup || isSubmitting || fullCode.length < CODE_LENGTH
          }
          className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={{ backgroundColor: "#4CAF50" }}
        >
          {isSubmitting ? dict.enabling : dict.enableButton}
        </button>

        {canSkip ? (
          <button
            type="button"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            {dict.skipButton}
          </button>
        ) : null}

        <div className="pt-1 flex items-center justify-center gap-4 text-[11px] text-gray-400">
          <span>{dict.securityNoteEncrypted}</span>
          <span>{dict.securityNoteRecovery}</span>
        </div>
      </div>
    </div>
  );
}
