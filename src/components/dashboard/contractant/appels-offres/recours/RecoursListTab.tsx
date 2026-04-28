"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Eye } from "lucide-react";

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
  listServiceContractantTenderRecours,
  type ServiceContractantTenderRecoursListItem,
  type TenderRecoursStatus,
} from "@/services/tenderRecours";

interface RecoursListTabProps {
  locale: string;
  dict: any;
  aoId: string;
  isRtl: boolean;
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

function isOverdue(responseDeadlineAt: string) {
  const deadline = new Date(`${responseDeadlineAt}T23:59:59.999Z`);
  if (Number.isNaN(deadline.getTime())) {
    return false;
  }

  return Date.now() > deadline.getTime();
}

function getStatusLabel(status: TenderRecoursStatus, dict: any) {
  switch (status) {
    case "depose":
      return dict.statusLabels?.depose || "Déposé";
    case "en_examen":
      return dict.statusLabels?.en_examen || "En examen";
    case "accepte":
      return dict.statusLabels?.accepte || "Accepté";
    case "rejete":
      return dict.statusLabels?.rejete || "Rejeté";
    default:
      return status;
  }
}

function getStatusClass(status: TenderRecoursStatus) {
  switch (status) {
    case "depose":
      return "border-blue-200 bg-blue-100 text-blue-700";
    case "en_examen":
      return "border-amber-200 bg-amber-100 text-amber-700";
    case "accepte":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "rejete":
      return "border-red-200 bg-red-100 text-red-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export default function RecoursListTab({
  locale,
  dict,
  aoId,
  isRtl,
}: RecoursListTabProps) {
  const [rows, setRows] = useState<ServiceContractantTenderRecoursListItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listServiceContractantTenderRecours(aoId);
      setRows(response);
    } catch {
      setError(dict.error || "Impossible de charger les recours.");
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
        {dict.loading || "Chargement des recours..."}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center text-xs text-slate-600">
          {dict.empty || "Aucun recours déposé pour cet AO."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  {dict.table?.reference || "Référence"}
                </TableHead>
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  {dict.table?.operator || "Opérateur"}
                </TableHead>
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  {dict.table?.dateDepot || "Date dépôt"}
                </TableHead>
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  {dict.table?.dateLimite || "Date limite réponse"}
                </TableHead>
                <TableHead className="h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  {dict.table?.status || "Statut"}
                </TableHead>
                <TableHead
                  className={cn(
                    "h-10 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500",
                    isRtl ? "text-left" : "text-right",
                  )}
                >
                  {dict.table?.actions || "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row) => {
                const overdue = isOverdue(row.responseDeadlineAt);
                const detailHref = `/${locale}/dashboard/contractant/appels-offres/${aoId}/recours/${row.id}`;

                return (
                  <TableRow
                    key={row.id}
                    className="border-b border-slate-100 text-xs"
                  >
                    <TableCell className="px-3 py-2.5 font-semibold text-[#2F9E44]">
                      {row.reference}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-slate-700">
                      {row.operatorName}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-slate-700">
                      {formatDate(row.submittedAt, locale)}
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <div className="flex flex-wrap items-center gap-2 text-slate-700">
                        <span>
                          {formatDate(row.responseDeadlineAt, locale)}
                        </span>
                        {overdue && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                            <AlertTriangle className="h-3 w-3" />
                            {dict.table?.overdue || "Retard"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-6 rounded-full px-2 text-[10px] font-semibold",
                          getStatusClass(row.status),
                        )}
                      >
                        {getStatusLabel(row.status, dict)}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "px-3 py-2.5",
                        isRtl ? "text-left" : "text-right",
                      )}
                    >
                      <Link
                        href={detailHref}
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3 w-3" />
                        {dict.table?.view || "Voir"}
                      </Link>
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
