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
  dict?: any;
  onViewDetail: (id: string) => void;
}

function getStatusLabel(status: GreAGreRequestStatus, dict: any) {
  const statusDict = dict?.filters;
  if (!statusDict) return status;

  switch (status) {
    case "brouillon":
      return statusDict.brouillon;
    case "soumise":
      return statusDict.soumise;
    case "en_analyse_ia":
      return statusDict.en_analyse_ia;
    case "acceptee":
      return statusDict.acceptee;
    case "rejetee":
      return statusDict.rejetee;
    case "en_revision":
      return statusDict.en_revision;
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

function getIaScoreClass(score: number | undefined | null): string {
  if (score === undefined || score === null) return "text-slate-400";
  if (score >= 70) return "text-emerald-700 font-semibold";
  if (score >= 40) return "text-amber-700 font-semibold";
  return "text-red-700 font-semibold";
}

function getRecommendationBadge(score: number | undefined | null): { label: string; className: string } | null {
  if (score === undefined || score === null) return null;
  if (score >= 70) return { label: "Conforme", className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  if (score >= 40) return { label: "Révision requise", className: "border-amber-200 bg-amber-50 text-amber-700" };
  return { label: "Non conforme", className: "border-red-200 bg-red-50 text-red-700" };
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

function formatAmount(amount: string, dict: any) {
  const parsed = Number.parseFloat(amount.replace(/\s/g, ""));
  const currency = "DZD";

  if (Number.isNaN(parsed)) {
    return `${amount} ${currency}`;
  }

  return `${new Intl.NumberFormat("fr-FR").format(parsed)} ${currency}`;
}

export default function GreAGreTable({
  locale,
  isRtl,
  data,
  isLoading,
  dict,
  onViewDetail,
}: GreAGreTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
        </div>
        <p className="text-xs text-slate-600">
          {dict?.table?.loading || dict?.loading || "Chargement..."}
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <FileSearch className="h-5 w-5 text-slate-500" />
        </div>
        <p className="text-xs text-slate-600">
          {dict?.table?.empty || dict?.empty || "Aucune demande trouvée."}
        </p>
      </div>
    );
  }

  const tableDict = dict?.table || {};

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {tableDict.reference || "Référence"}
            </TableHead>
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {tableDict.object || "Objet"}
            </TableHead>
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {tableDict.estimatedAmount || "Montant estimé"}
            </TableHead>
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {tableDict.status || "Statut"}
            </TableHead>
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {tableDict.submissionDate || "Date soumission"}
            </TableHead>
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {tableDict.iaComplianceScore || "Score IA"}
            </TableHead>
            <TableHead className="h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {tableDict.iaRecommendation || "Recommandation IA"}
            </TableHead>
            <TableHead
              className={cn(
                "h-10 whitespace-nowrap px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500",
                isRtl ? "text-left" : "text-right",
              )}
            >
              {tableDict.actions || "Actions"}
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
                {formatAmount(row.estimatedAmount, dict)}
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-6 rounded-full px-2 text-[10px] font-semibold",
                      getStatusClass(row.status),
                    )}
                  >
                    {getStatusLabel(row.status, dict)}
                  </Badge>
                  {row.status === "en_analyse_ia" && (
                    <Loader2 className="h-3 w-3 animate-spin text-purple-500" />
                  )}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                {formatDate(row.submittedAt, locale)}
              </TableCell>
              <TableCell className={cn("whitespace-nowrap px-4 py-3 text-xs", getIaScoreClass(row.iaComplianceScore))}>
                {typeof row.iaComplianceScore === "number" ? `${row.iaComplianceScore}/100` : "—"}
              </TableCell>
              <TableCell className="whitespace-nowrap px-4 py-3">
                {(() => {
                  const rec = getRecommendationBadge(row.iaComplianceScore);
                  return rec ? (
                    <Badge variant="outline" className={cn("h-6 rounded-full px-2 text-[10px] font-semibold", rec.className)}>
                      {rec.label}
                    </Badge>
                  ) : <span className="text-xs text-slate-400">—</span>;
                })()}
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
                  {tableDict.view || "Voir"}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
