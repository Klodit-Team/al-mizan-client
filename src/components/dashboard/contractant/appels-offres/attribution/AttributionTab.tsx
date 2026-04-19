"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BellRing, Check, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  computeRecoursEndDateFromAttributionDate,
  confirmServiceContractantDefinitiveAttribution,
  getServiceContractantTenderAttributionOverview,
  pronounceServiceContractantProvisionalAttribution,
  type ServiceContractantTenderAttributionOverview,
  type TenderAttributionStatus,
} from "@/services/tenderAttribution";

interface AttributionTabProps {
  locale: string;
  aoId: string;
  onDefinitiveConfirmed?: () => void;
}

function todayDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateValue: string, locale: string) {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

function formatDateTime(dateValue: string, locale: string) {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

function formatAmount(amount: string) {
  const parsed = Number.parseFloat(amount.replace(/\s/g, ""));
  if (Number.isNaN(parsed)) {
    return `${amount} DZD`;
  }

  return `${new Intl.NumberFormat("fr-FR").format(parsed)} DZD`;
}

function getAttributionStatusLabel(status: TenderAttributionStatus) {
  switch (status) {
    case "publiee":
      return "Publiee";
    case "en_recours":
      return "En recours";
    case "confirmee":
      return "Confirmee";
    case "annulee":
      return "Annulee";
    default:
      return status;
  }
}

function getAttributionStatusClass(status: TenderAttributionStatus) {
  switch (status) {
    case "publiee":
      return "border-blue-200 bg-blue-100 text-blue-700";
    case "en_recours":
      return "border-amber-200 bg-amber-100 text-amber-700";
    case "confirmee":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "annulee":
      return "border-red-200 bg-red-100 text-red-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export default function AttributionTab({
  locale,
  aoId,
  onDefinitiveConfirmed,
}: AttributionTabProps) {
  const [overview, setOverview] =
    useState<ServiceContractantTenderAttributionOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSubmissionId, setSelectedSubmissionId] = useState("");
  const [attributedAmount, setAttributedAmount] = useState("");
  const [reason, setReason] = useState("");
  const [attributionDate, setAttributionDate] = useState(todayDateInputValue);

  const [signatureDate, setSignatureDate] = useState(todayDateInputValue);
  const [executionDelayDays, setExecutionDelayDays] = useState("90");

  const [isSubmittingProvisional, setIsSubmittingProvisional] = useState(false);
  const [isSubmittingDefinitive, setIsSubmittingDefinitive] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const recoursEndDatePreview = useMemo(
    () => computeRecoursEndDateFromAttributionDate(attributionDate),
    [attributionDate],
  );

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response =
        await getServiceContractantTenderAttributionOverview(aoId);
      setOverview(response);

      if (!selectedSubmissionId && response.eligibleSubmissions.length > 0) {
        setSelectedSubmissionId(response.eligibleSubmissions[0].submissionId);
      }
    } catch {
      setError("Impossible de charger les informations d'attribution.");
    } finally {
      setIsLoading(false);
    }
  }, [aoId, selectedSubmissionId]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const pronounceProvisional = async () => {
    if (!selectedSubmissionId || !attributedAmount.trim() || !reason.trim()) {
      setActionError("Completez tous les champs de l'attribution provisoire.");
      return;
    }

    setActionError(null);
    setSuccessMessage(null);
    setIsSubmittingProvisional(true);

    try {
      const updated = await pronounceServiceContractantProvisionalAttribution(
        aoId,
        {
          selectedSubmissionId,
          attributedAmount: attributedAmount.trim(),
          reason: reason.trim(),
          attributionDate,
        },
      );

      setOverview(updated);
      setSuccessMessage(
        `Attribution provisoire publiee. Notification envoyee a ${updated.provisionalAttribution?.notificationsRecipients || 0} soumissionnaires.`,
      );
    } catch {
      setActionError("Impossible de prononcer l'attribution provisoire.");
    } finally {
      setIsSubmittingProvisional(false);
    }
  };

  const confirmDefinitive = async () => {
    if (!signatureDate || !executionDelayDays.trim()) {
      setActionError(
        "Renseignez la date de signature et le delai d'execution.",
      );
      return;
    }

    setActionError(null);
    setSuccessMessage(null);
    setIsSubmittingDefinitive(true);

    try {
      const updated = await confirmServiceContractantDefinitiveAttribution(
        aoId,
        {
          signatureDate,
          executionDelayDays: executionDelayDays.trim(),
        },
      );

      setOverview(updated);
      setSuccessMessage(
        "Attribution definitive confirmee. Marche cree avec succes.",
      );
      onDefinitiveConfirmed?.();
    } catch {
      setActionError("Impossible de confirmer l'attribution definitive.");
    } finally {
      setIsSubmittingDefinitive(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        Chargement des informations d'attribution...
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
        {error || "Impossible de charger les donnees d'attribution."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
          {successMessage}
        </div>
      )}

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {actionError}
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-3">
        <header className="mb-2">
          <h3 className="text-sm font-semibold text-slate-900">
            Attribution provisoire
          </h3>
          <p className="text-xs text-slate-500">
            Liste classee des soumissions eligibles et prononce de
            l'attribution.
          </p>
        </header>

        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold text-slate-600">
                <th className="px-3 py-2">Reference</th>
                <th className="px-3 py-2">Operateur</th>
                <th className="px-3 py-2">Score global</th>
                <th className="px-3 py-2">Montant offre</th>
              </tr>
            </thead>
            <tbody>
              {overview.eligibleSubmissions.map((row) => (
                <tr
                  key={row.submissionId}
                  className="border-b border-slate-100 text-xs text-slate-700"
                >
                  <td className="px-3 py-2 font-semibold text-[#2F9E44]">
                    {row.reference}
                  </td>
                  <td className="px-3 py-2">{row.operatorOrganizationName}</td>
                  <td className="px-3 py-2">{row.scoreGlobal}</td>
                  <td className="px-3 py-2">
                    {formatAmount(row.offeredAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">
              Soumission gagnante
            </label>
            <select
              value={selectedSubmissionId}
              onChange={(event) => setSelectedSubmissionId(event.target.value)}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs outline-none focus:border-[#4CAF50]"
            >
              <option value="">Selectionner</option>
              {overview.eligibleSubmissions.map((row) => (
                <option key={row.submissionId} value={row.submissionId}>
                  {row.reference} - {row.operatorOrganizationName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">
              Montant attribue (DZD)
            </label>
            <input
              value={attributedAmount}
              onChange={(event) => setAttributedAmount(event.target.value)}
              placeholder="Ex. 45 220 000"
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs outline-none focus:border-[#4CAF50]"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">
              Date attribution
            </label>
            <input
              type="date"
              value={attributionDate}
              onChange={(event) => setAttributionDate(event.target.value)}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs outline-none focus:border-[#4CAF50]"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">
              Date fin recours (auto +10 jours)
            </label>
            <input
              value={recoursEndDatePreview}
              readOnly
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-100 px-3 text-xs text-slate-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">
              Motif
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Motif de l'attribution provisoire"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#4CAF50]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            void pronounceProvisional();
          }}
          disabled={isSubmittingProvisional}
          className="mt-3 inline-flex h-9 items-center gap-1 rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <BellRing className="h-3.5 w-3.5" />
          {isSubmittingProvisional
            ? "Publication..."
            : "Prononcer attribution provisoire"}
        </button>
      </section>

      {overview.provisionalAttribution && overview.status && (
        <section className="rounded-lg border border-slate-200 bg-white p-3">
          <header className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Post-attribution
            </h3>
            <Badge
              variant="outline"
              className={cn(
                "h-6 rounded-full px-2 text-[10px] font-semibold",
                getAttributionStatusClass(overview.status),
              )}
            >
              {getAttributionStatusLabel(overview.status)}
            </Badge>
          </header>

          <div className="grid grid-cols-1 gap-2 text-xs text-slate-700 md:grid-cols-2">
            <p>
              Soumission retenue:{" "}
              <span className="font-semibold text-slate-900">
                {overview.provisionalAttribution.selectedSubmissionReference} -{" "}
                {overview.provisionalAttribution.selectedOperatorName}
              </span>
            </p>
            <p>
              Montant attribue:{" "}
              <span className="font-semibold text-slate-900">
                {formatAmount(overview.provisionalAttribution.attributedAmount)}
              </span>
            </p>
            <p>
              Date attribution:{" "}
              <span className="font-semibold text-slate-900">
                {formatDate(
                  overview.provisionalAttribution.attributionDate,
                  locale,
                )}
              </span>
            </p>
            <p>
              Date fin recours:{" "}
              <span className="font-semibold text-slate-900">
                {formatDate(
                  overview.provisionalAttribution.recoursEndDate,
                  locale,
                )}
              </span>
            </p>
            <p className="md:col-span-2">
              Notification soumissionnaires:{" "}
              <span className="font-semibold text-slate-900">
                {overview.provisionalAttribution.notificationsRecipients}
              </span>{" "}
              envoyees le{" "}
              <span className="font-semibold text-slate-900">
                {formatDateTime(
                  overview.provisionalAttribution.notificationsTriggeredAt,
                  locale,
                )}
              </span>
            </p>
          </div>

          {overview.status === "en_recours" &&
            typeof overview.countdownDaysToRecoursEnd === "number" && (
              <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                Fin de recours dans {overview.countdownDaysToRecoursEnd}{" "}
                jour(s).
              </p>
            )}
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-3">
        <header className="mb-2">
          <h3 className="text-sm font-semibold text-slate-900">
            Attribution definitive
          </h3>
          <p className="text-xs text-slate-500">
            Disponible uniquement apres delai de recours expire sans recours
            bloquant.
          </p>
        </header>

        {overview.provisionalAttribution ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 text-xs text-slate-700 md:grid-cols-2">
              <p>
                Attribution provisoire liee:{" "}
                <span className="font-semibold text-slate-900">
                  {overview.provisionalAttribution.id}
                </span>
              </p>
              <p>
                Soumission gagnante:{" "}
                <span className="font-semibold text-slate-900">
                  {overview.provisionalAttribution.selectedSubmissionReference}
                </span>
              </p>
              <p>
                Operateur:{" "}
                <span className="font-semibold text-slate-900">
                  {overview.provisionalAttribution.selectedOperatorName}
                </span>
              </p>
              <p>
                Montant attribue:{" "}
                <span className="font-semibold text-slate-900">
                  {formatAmount(
                    overview.provisionalAttribution.attributedAmount,
                  )}
                </span>
              </p>
            </div>

            <p
              className={cn(
                "rounded-md border px-3 py-2 text-xs",
                overview.canConfirmDefinitive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700",
              )}
            >
              {overview.definitiveConditionMessage}
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                  Date signature
                </label>
                <input
                  type="date"
                  value={signatureDate}
                  onChange={(event) => setSignatureDate(event.target.value)}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs outline-none focus:border-[#4CAF50]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                  Delai execution (jours)
                </label>
                <input
                  value={executionDelayDays}
                  onChange={(event) =>
                    setExecutionDelayDays(event.target.value)
                  }
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs outline-none focus:border-[#4CAF50]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                void confirmDefinitive();
              }}
              disabled={
                !overview.canConfirmDefinitive || isSubmittingDefinitive
              }
              className="inline-flex h-9 items-center gap-1 rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" />
              {isSubmittingDefinitive
                ? "Confirmation..."
                : "Confirmer attribution definitive"}
            </button>
          </div>
        ) : (
          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Attribution definitive indisponible: aucune attribution provisoire.
          </p>
        )}
      </section>

      {overview.definitiveAttribution && (
        <section className="rounded-lg border border-slate-200 bg-white p-3">
          <header className="mb-2 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#2F9E44]" />
            <h3 className="text-sm font-semibold text-slate-900">
              Marche cree (post-confirmation)
            </h3>
          </header>

          <div className="grid grid-cols-1 gap-2 text-xs text-slate-700 md:grid-cols-2">
            <p>
              Reference marche:{" "}
              <span className="font-semibold text-slate-900">
                {overview.definitiveAttribution.marche.reference}
              </span>
            </p>
            <p>
              Montant global:{" "}
              <span className="font-semibold text-slate-900">
                {formatAmount(
                  overview.definitiveAttribution.marche.globalAmount,
                )}
              </span>
            </p>
            <p>
              Date signature:{" "}
              <span className="font-semibold text-slate-900">
                {formatDate(
                  overview.definitiveAttribution.marche.signatureDate,
                  locale,
                )}
              </span>
            </p>
            <p>
              Delai execution:{" "}
              <span className="font-semibold text-slate-900">
                {overview.definitiveAttribution.marche.executionDelayDays} jours
              </span>
            </p>
            <p>
              Date fin prevue:{" "}
              <span className="font-semibold text-slate-900">
                {formatDate(
                  overview.definitiveAttribution.marche.expectedEndDate,
                  locale,
                )}
              </span>
            </p>
            <p>
              Confirmation definitive:{" "}
              <span className="font-semibold text-slate-900">
                {formatDateTime(
                  overview.definitiveAttribution.confirmedAt,
                  locale,
                )}
              </span>
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
