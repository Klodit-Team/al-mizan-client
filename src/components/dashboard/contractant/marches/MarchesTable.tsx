"use client";

import Link from "next/link";
import { Eye, FileSearch, Loader2 } from "lucide-react";

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
  type ServiceContractantMarcheListItem,
  type TenderMarcheStatus,
} from "@/services/tenderMarches";

interface MarchesTableProps {
  locale: string;
  isRtl: boolean;
  rows: ServiceContractantMarcheListItem[];
  isLoading: boolean;
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

export default function MarchesTable({
  locale,
  isRtl,
  rows,
  isLoading,
}: MarchesTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
        </div>
        <p className="text-xs text-slate-600">Chargement des marches...</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <FileSearch className="h-5 w-5 text-slate-500" />
        </div>
        <p className="text-xs text-slate-600">Aucun marche trouve.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Reference
            </TableHead>
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Objet
            </TableHead>
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Operateur economique
            </TableHead>
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Montant global
            </TableHead>
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Date signature
            </TableHead>
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Date fin prevue
            </TableHead>
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Statut
            </TableHead>
            <TableHead
              className={cn(
                "h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500",
                isRtl ? "text-left" : "text-right",
              )}
            >
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => {
            const detailHref = `/${locale}/dashboard/contractant/marches/${row.id}`;

            return (
              <TableRow
                key={row.id}
                className="border-b border-slate-100 hover:bg-slate-50/70"
              >
                <TableCell className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-[#4CAF50]">
                  {row.reference}
                </TableCell>
                <TableCell className="max-w-65 px-4 py-3 text-xs text-slate-700">
                  {row.object}
                </TableCell>
                <TableCell className="max-w-55 px-4 py-3 text-xs text-slate-700">
                  {row.economicOperatorName}
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3 text-xs text-slate-700">
                  {formatAmount(row.globalAmount)}
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                  {formatDate(row.signatureDate, locale)}
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                  {formatDate(row.expectedEndDate, locale)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-6 rounded-full px-2 text-[10px] font-semibold",
                      getStatusClass(row.status),
                    )}
                  >
                    {getStatusLabel(row.status)}
                  </Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    "px-4 py-3",
                    isRtl ? "text-left" : "text-right",
                  )}
                >
                  <Link
                    href={detailHref}
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Eye className="h-3 w-3" />
                    Voir
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
