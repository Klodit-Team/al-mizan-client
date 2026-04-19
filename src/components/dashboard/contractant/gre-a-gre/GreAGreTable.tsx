"use client";

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
  type GreAGreRequestStatus,
  type ServiceContractantGreAGreRequestItem,
} from "@/services/greAGre";

interface GreAGreTableProps {
  locale: string;
  isRtl: boolean;
  data: ServiceContractantGreAGreRequestItem[];
  isLoading: boolean;
  onViewDetail: (id: string) => void;
}

function getStatusLabel(status: GreAGreRequestStatus) {
  switch (status) {
    case "brouillon":
      return "Brouillon";
    case "soumise":
      return "Soumise";
    case "en_analyse_ia":
      return "En analyse IA";
    case "acceptee":
      return "Acceptee";
    case "rejetee":
      return "Rejetee";
    case "en_revision":
      return "En revision";
    default:
      return status;
  }
}

function getStatusClass(status: GreAGreRequestStatus) {
  switch (status) {
    case "brouillon":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "soumise":
      return "border-blue-200 bg-blue-100 text-blue-700";
    case "en_analyse_ia":
      return "border-purple-200 bg-purple-100 text-purple-700";
    case "acceptee":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "rejetee":
      return "border-red-200 bg-red-100 text-red-700";
    case "en_revision":
      return "border-amber-200 bg-amber-100 text-amber-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
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

export default function GreAGreTable({
  locale,
  isRtl,
  data,
  isLoading,
  onViewDetail,
}: GreAGreTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
        </div>
        <p className="text-xs text-slate-600">Chargement des demandes...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <FileSearch className="h-5 w-5 text-slate-500" />
        </div>
        <p className="text-xs text-slate-600">Aucune demande trouvee.</p>
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
              Montant estime
            </TableHead>
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Statut
            </TableHead>
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Date soumission
            </TableHead>
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Score conformite IA
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
          {data.map((row) => (
            <TableRow
              key={row.id}
              className="border-b border-slate-100 hover:bg-slate-50/70"
            >
              <TableCell className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-[#4CAF50]">
                {row.reference}
              </TableCell>
              <TableCell className="max-w-[360px] px-4 py-3 text-xs text-slate-700">
                {row.object}
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                {formatAmount(row.estimatedAmount)}
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
              <TableCell className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                {formatDate(row.submittedAt, locale)}
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 py-3 text-xs text-slate-700">
                {typeof row.iaComplianceScore === "number"
                  ? `${row.iaComplianceScore}/100`
                  : "-"}
              </TableCell>
              <TableCell
                className={cn("px-4 py-3", isRtl ? "text-left" : "text-right")}
              >
                <button
                  type="button"
                  onClick={() => onViewDetail(row.id)}
                  className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Eye className="h-3 w-3" />
                  Voir
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
