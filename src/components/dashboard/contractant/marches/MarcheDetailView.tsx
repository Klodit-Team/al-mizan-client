"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  type ServiceContractantMarcheDetail,
  type TenderMarcheNextStatus,
  type TenderMarcheStatus,
  updateServiceContractantMarcheStatus,
} from "@/services/tenderMarches";

interface MarcheDetailViewProps {
  locale: string;
  initialMarche: ServiceContractantMarcheDetail;
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

function formatAmount(amount: string) {
  const parsed = Number.parseFloat(amount.replace(/\s/g, ""));
  if (Number.isNaN(parsed)) {
    return `${amount} DZD`;
  }

  return `${new Intl.NumberFormat("fr-FR").format(parsed)} DZD`;
}

function getStatusLabel(status: TenderMarcheStatus) {
  switch (status) {
    case "en_cours":
      return "En cours";
    case "termine":
      return "Termine";
    case "resilie":
      return "Resilie";
    default:
      return status;
  }
}

function getStatusClass(status: TenderMarcheStatus) {
  switch (status) {
    case "en_cours":
      return "border-blue-200 bg-blue-100 text-blue-700";
    case "termine":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "resilie":
      return "border-red-200 bg-red-100 text-red-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export default function MarcheDetailView({
  locale,
  initialMarche,
}: MarcheDetailViewProps) {
  const [marche, setMarche] = useState(initialMarche);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canUpdateStatus = marche.status === "en_cours";
  const listHref = `/${locale}/dashboard/contractant/marches`;
  const aoHref = `/${locale}/dashboard/contractant/appels-offres/${marche.originTenderId}`;

  const handleUpdateStatus = async (nextStatus: TenderMarcheNextStatus) => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateServiceContractantMarcheStatus(
        marche.id,
        nextStatus,
      );
      setMarche(updated);
      setSuccess(`Statut mis a jour: ${getStatusLabel(updated.status)}.`);
    } catch {
      setError("Impossible de mettre a jour le statut du marche.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-bold uppercase tracking-[0.03em] text-slate-900">
            Marche Detail
          </h1>
          <p className="text-xs text-slate-500">
            Reference: {marche.reference}
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {marche.object}
          </p>
          <Badge
            variant="outline"
            className={cn(
              "mt-1 h-6 rounded-full px-2 text-[10px] font-semibold",
              getStatusClass(marche.status),
            )}
          >
            {getStatusLabel(marche.status)}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={listHref}
            className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Retour a la liste
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Operateur economique
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {marche.economicOperatorName}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Contact: {marche.economicOperatorContactName}
          </p>
          <p className="text-xs text-slate-600">
            {marche.economicOperatorContactEmail} -{" "}
            {marche.economicOperatorContactPhone}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Montant global
          </p>
          <p className="mt-2 text-sm text-slate-800">
            {formatAmount(marche.globalAmount)}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Date signature
          </p>
          <p className="mt-2 text-sm text-slate-800">
            {formatDate(marche.signatureDate, locale)}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Delai execution (jours)
          </p>
          <p className="mt-2 text-sm text-slate-800">
            {marche.executionDelayDays}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Date fin prevue
          </p>
          <p className="mt-2 text-sm text-slate-800">
            {formatDate(marche.expectedEndDate, locale)}
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
          Appel d'offres lie
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-800">{marche.aoReference}</span>
          <Link
            href={aoHref}
            className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            Ouvrir l'AO d'origine
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
          Actions
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!canUpdateStatus || isUpdating}
            onClick={() => handleUpdateStatus("termine")}
            className="inline-flex h-8 items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Marquer termine
          </button>

          <button
            type="button"
            disabled={!canUpdateStatus || isUpdating}
            onClick={() => handleUpdateStatus("resilie")}
            className="inline-flex h-8 items-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Marquer resilie
          </button>

          {!canUpdateStatus && (
            <span className="text-xs text-slate-500">
              Statut final atteint, modification indisponible.
            </span>
          )}
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-700">
            {success}
          </div>
        )}
      </section>
    </div>
  );
}
