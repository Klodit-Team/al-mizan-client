"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Monitor,
  Smartphone,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  confirmServiceContractantMfaSetup,
  disableServiceContractantMfa,
  getServiceContractantSecurityOverview,
  revokeAllOtherServiceContractantSessions,
  revokeServiceContractantSession,
  startServiceContractantMfaSetup,
  type MfaSetupData,
  type ServiceContractantSecurityOverview,
} from "@/services/contractantSecurity";

function formatDateTime(value: string, locale: string) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

const QR_PATTERN = [
  1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1,
];

interface SecuritySettingsPageProps {
  locale: string;
}

export default function SecuritySettingsPage({
  locale,
}: SecuritySettingsPageProps) {
  const [overview, setOverview] =
    useState<ServiceContractantSecurityOverview | null>(null);
  const [setupData, setSetupData] = useState<MfaSetupData | null>(null);
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getServiceContractantSecurityOverview();
      setOverview(response);
    } catch {
      setError("Impossible de charger les parametres de securite.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const otherSessionsCount = useMemo(
    () => overview?.sessions.filter((item) => !item.isCurrent).length ?? 0,
    [overview],
  );

  const activateMfa = async () => {
    setIsBusy(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const setup = await startServiceContractantMfaSetup();
      setSetupData(setup);
    } catch {
      setError("Impossible de lancer la configuration MFA.");
    } finally {
      setIsBusy(false);
    }
  };

  const confirmMfa = async () => {
    setIsBusy(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await confirmServiceContractantMfaSetup();
      setOverview(updated);
      setSetupData(null);
      setSuccessMessage("MFA active avec succes.");
    } catch {
      setError("Impossible de confirmer l'activation MFA.");
    } finally {
      setIsBusy(false);
    }
  };

  const disableMfa = async () => {
    setIsBusy(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await disableServiceContractantMfa(disablePassword);
      setOverview(updated);
      setDisablePassword("");
      setShowDisableConfirm(false);
      setSuccessMessage("MFA desactive avec succes.");
    } catch {
      setError("Impossible de desactiver le MFA. Verifiez votre mot de passe.");
    } finally {
      setIsBusy(false);
    }
  };

  const revokeOne = async (sessionId: string) => {
    setIsBusy(true);
    setError(null);

    try {
      const updated = await revokeServiceContractantSession(sessionId);
      setOverview(updated);
    } catch {
      setError("Impossible de revoquer cette session.");
    } finally {
      setIsBusy(false);
    }
  };

  const revokeAllOthers = async () => {
    setIsBusy(true);
    setError(null);

    try {
      const updated = await revokeAllOtherServiceContractantSessions();
      setOverview(updated);
    } catch {
      setError("Impossible de revoquer les autres sessions.");
    } finally {
      setIsBusy(false);
    }
  };

  if (isLoading || !overview) {
    return (
      <div className="space-y-3">
        <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Security Settings
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          MFA, sessions actives et controle d'acces de compte.
        </p>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-slate-400" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600">
            MFA status
          </h2>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-700">
              {overview.mfaEnabled
                ? "Le MFA est active pour ce compte."
                : "Le MFA est desactive pour ce compte."}
            </p>
            <div className="mt-2">
              {overview.mfaEnabled ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                  <XCircle className="h-3 w-3" /> Disabled
                </span>
              )}
            </div>
          </div>

          {overview.mfaEnabled ? (
            <button
              type="button"
              onClick={() => setShowDisableConfirm(true)}
              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
              disabled={isBusy}
            >
              Disable MFA
            </button>
          ) : (
            <button
              type="button"
              onClick={activateMfa}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#4CAF50" }}
              disabled={isBusy}
            >
              Enable MFA
            </button>
          )}
        </div>

        {setupData && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold text-emerald-800">
              Scannez le QR avec votre application d'authentification.
            </p>
            <div className="mt-3 flex h-36 w-36 items-center justify-center rounded-lg border border-emerald-200 bg-white p-2">
              <div className="grid grid-cols-5 gap-px">
                {QR_PATTERN.map((cell, index) => (
                  <div
                    key={index}
                    className={`h-5 w-5 rounded-sm ${cell ? "bg-slate-800" : "bg-white"}`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-[11px] text-emerald-700">
              Cle manuelle:{" "}
              <span className="font-mono font-bold">{setupData.manualKey}</span>
            </p>
            <button
              type="button"
              onClick={confirmMfa}
              disabled={isBusy}
              className="mt-3 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#4CAF50" }}
            >
              Confirmer l'activation
            </button>
          </div>
        )}

        {showDisableConfirm && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-semibold text-red-700">
              Entrez le mot de passe actuel pour desactiver le MFA.
            </p>
            <input
              type="password"
              value={disablePassword}
              onChange={(event) => setDisablePassword(event.target.value)}
              className="mt-2 h-9 w-full rounded-lg border border-red-200 bg-white px-3 text-xs text-slate-800 outline-none"
              placeholder="Mot de passe actuel"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={disableMfa}
                disabled={isBusy}
                className="rounded-lg border border-red-300 bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                Confirmer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDisableConfirm(false);
                  setDisablePassword("");
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-slate-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Sessions
            </h2>
          </div>
          {otherSessionsCount > 0 && (
            <button
              type="button"
              onClick={revokeAllOthers}
              disabled={isBusy}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Revoke all other sessions
            </button>
          )}
        </div>

        <ul className="space-y-2">
          {overview.sessions.map((session) => (
            <li
              key={session.id}
              className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-3 text-xs ${
                session.isCurrent
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div>
                <p className="font-semibold text-slate-800">
                  {session.userAgent}
                </p>
                <p className="mt-0.5 text-slate-500">IP: {session.ip}</p>
                <p className="text-slate-400">
                  {formatDateTime(session.createdAt, locale)}
                </p>
                {session.isCurrent && (
                  <span className="mt-1 inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Session actuelle
                  </span>
                )}
              </div>

              {!session.isCurrent && (
                <button
                  type="button"
                  onClick={() => revokeOne(session.id)}
                  disabled={isBusy}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  title="Revoke session"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
        <LinkText locale={locale} />
      </div>
    </div>
  );
}

function LinkText({ locale }: { locale: string }) {
  return (
    <p>
      Acces rapide:{" "}
      <a
        href={`/${locale}/dashboard/contractant/profil`}
        className="font-semibold text-[#2F9E44] hover:underline"
      >
        Mon profil
      </a>
    </p>
  );
}
