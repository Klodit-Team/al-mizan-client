"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Eye, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  listServiceContractantTenderSubmissions,
  type ServiceContractantTenderSubmissionListItem,
  type TenderCautionStatus,
  type TenderSubmissionStatus,
} from "@/services/tenderSubmissions";

interface SoumissionsListTabProps {
  locale: string;
  aoId: string;
  isRtl: boolean;
  canViewDetail: boolean;
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

function getSubmissionStatusLabel(status: TenderSubmissionStatus) {
  switch (status) {
    case "recue":
      return "Recue";
    case "en_verification":
      return "En verification";
    case "technique_conforme":
      return "Technique conforme";
    case "technique_non_conforme":
      return "Technique non conforme";
    case "retenue":
      return "Retenue";
    case "rejetee":
      return "Rejetee";
    default:
      return status;
  }
}

function getSubmissionStatusClass(status: TenderSubmissionStatus) {
  switch (status) {
    case "recue":
      return "border-blue-200 bg-blue-100 text-blue-700";
    case "en_verification":
      return "border-amber-200 bg-amber-100 text-amber-700";
    case "technique_conforme":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "technique_non_conforme":
      return "border-red-200 bg-red-100 text-red-700";
    case "retenue":
      return "border-green-200 bg-green-100 text-green-700";
    case "rejetee":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getCautionStatusLabel(status: TenderCautionStatus) {
  switch (status) {
    case "valid":
      return "Valide";
    case "expired":
      return "Expiree";
    case "missing":
      return "Manquante";
    default:
      return status;
  }
}

function getCautionStatusClass(status: TenderCautionStatus) {
  switch (status) {
    case "valid":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "expired":
      return "border-amber-200 bg-amber-100 text-amber-700";
    case "missing":
      return "border-red-200 bg-red-100 text-red-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export default function SoumissionsListTab({
  locale,
  aoId,
  isRtl,
  canViewDetail,
}: SoumissionsListTabProps) {
  const [rows, setRows] = useState<
    ServiceContractantTenderSubmissionListItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listServiceContractantTenderSubmissions(aoId);
      setRows(data);
    } catch {
      setError("Impossible de charger les soumissions.");
    } finally {
      setIsLoading(false);
    }
  }, [aoId]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        Chargement des soumissions...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p className="font-semibold text-slate-700">Note ouverture des plis</p>
        <p className="mt-1">
          Offre financiere masque/chiffree jusqu a la phase ouverture des plis.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center text-xs text-slate-600">
          Aucune soumission recue pour cet AO.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Reference
                </TableHead>
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Operateur economique
                </TableHead>
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Lot
                </TableHead>
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Date depot
                </TableHead>
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Dans delai
                </TableHead>
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Statut
                </TableHead>
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Offre technique
                </TableHead>
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Caution
                </TableHead>
                <TableHead
                  className={cn(
                    "h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500",
                    isRtl ? "text-left" : "text-right",
                  )}
                >
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row) => {
                const detailHref = `/${locale}/dashboard/contractant/appels-offres/${aoId}/soumissions/${row.id}`;

                return (
                  <TableRow
                    key={row.id}
                    className="border-b border-slate-100 text-xs"
                  >
                    <TableCell className="px-3 py-2.5 font-semibold text-[#2F9E44]">
                      {row.reference}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-slate-700">
                      {row.operatorOrganizationName}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-slate-700">
                      {row.lotLabel || "-"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                      {formatDateTime(row.submittedAt, locale)}
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-6 rounded-full px-2 text-[10px] font-semibold",
                          row.withinDeadline
                            ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                            : "border-red-200 bg-red-100 text-red-700",
                        )}
                      >
                        {row.withinDeadline ? "Oui" : "Non"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-6 rounded-full px-2 text-[10px] font-semibold",
                          getSubmissionStatusClass(row.status),
                        )}
                      >
                        {getSubmissionStatusLabel(row.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-6 rounded-full px-2 text-[10px] font-semibold",
                          row.technicalOfferUploaded
                            ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                            : "border-red-200 bg-red-100 text-red-700",
                        )}
                      >
                        {row.technicalOfferUploaded ? "Oui" : "Non"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-6 rounded-full px-2 text-[10px] font-semibold",
                          getCautionStatusClass(row.cautionStatus),
                        )}
                      >
                        {getCautionStatusLabel(row.cautionStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "px-3 py-2.5",
                        isRtl ? "text-left" : "text-right",
                      )}
                    >
                      {canViewDetail ? (
                        <Link
                          href={detailHref}
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-3 w-3" />
                          Voir
                        </Link>
                      ) : (
                        <span className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2.5 text-[11px] font-semibold text-slate-500">
                          <Lock className="h-3 w-3" />
                          Post-ouverture
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
