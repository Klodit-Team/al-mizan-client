import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getServiceContractantTenderSubmissionById,
  type TenderAdministrativeDocumentStatus,
  type TenderCautionStatus,
  type TenderSubmissionStatus,
  type TenderTechnicalComplianceStatus,
} from "@/services/tenderSubmissions";

interface TenderSubmissionDetailPageProps {
  params: Promise<{ locale: string; id: string; soumissionId: string }>;
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

function getTechnicalComplianceLabel(status: TenderTechnicalComplianceStatus) {
  switch (status) {
    case "conforme":
      return "Conforme";
    case "non_conforme":
      return "Non conforme";
    case "en_verification":
      return "En verification";
    default:
      return status;
  }
}

function getTechnicalComplianceClass(status: TenderTechnicalComplianceStatus) {
  switch (status) {
    case "conforme":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "non_conforme":
      return "border-red-200 bg-red-100 text-red-700";
    case "en_verification":
      return "border-amber-200 bg-amber-100 text-amber-700";
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

function getAdministrativeStatusLabel(
  status: TenderAdministrativeDocumentStatus,
) {
  switch (status) {
    case "valide":
      return "Valide";
    case "incomplet":
      return "Incomplet";
    case "rejete":
      return "Rejete";
    case "en_attente":
      return "En attente";
    default:
      return status;
  }
}

function getAdministrativeStatusClass(
  status: TenderAdministrativeDocumentStatus,
) {
  switch (status) {
    case "valide":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "incomplet":
      return "border-amber-200 bg-amber-100 text-amber-700";
    case "rejete":
      return "border-red-200 bg-red-100 text-red-700";
    case "en_attente":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export default async function TenderSubmissionDetailPage({
  params,
}: TenderSubmissionDetailPageProps) {
  const { locale, id, soumissionId } = await params;

  const submission = await getServiceContractantTenderSubmissionById(
    id,
    soumissionId,
  );

  if (!submission) {
    notFound();
  }

  const backHref = `/${locale}/dashboard/contractant/appels-offres/${id}?tab=soumissions`;

  return (
    <main className="space-y-5 overflow-auto p-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] text-slate-500">
          Tableau de bord <span className="mx-1">/</span> Appels d'offres{" "}
          <span className="mx-1">/</span> Detail soumission
        </p>

        <header className="mb-4 mt-1 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Detail soumission post-ouverture
            </h1>
            <p className="mt-1 text-sm font-medium text-[#4CAF50]">
              AO {id} - {submission.reference}
            </p>
          </div>

          <Link
            href={backHref}
            className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Retour a la liste des soumissions
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs lg:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Operateur economique
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {submission.operatorOrganizationName}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Lot
            </p>
            <p className="mt-1 text-slate-800">{submission.lotLabel || "-"}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Date depot
            </p>
            <p className="mt-1 text-slate-800">
              {formatDateTime(submission.submittedAt, locale)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Statut
            </p>
            <Badge
              variant="outline"
              className={cn(
                "mt-1 h-6 rounded-full px-2 text-[10px] font-semibold",
                getSubmissionStatusClass(submission.status),
              )}
            >
              {getSubmissionStatusLabel(submission.status)}
            </Badge>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Offre technique
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Fichier
            </p>
            {submission.technicalOffer.fileUrl !== "#" ? (
              <a
                href={submission.technicalOffer.fileUrl}
                className="mt-1 inline-flex items-center gap-1 font-semibold text-[#2F9E44] hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                {submission.technicalOffer.fileName}
              </a>
            ) : (
              <p className="mt-1 text-slate-500">
                Aucun fichier technique fourni.
              </p>
            )}

            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Hash SHA-256
            </p>
            <p className="mt-1 break-all font-mono text-[11px] text-slate-700">
              {submission.technicalOffer.sha256Hash}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Conformite
            </p>
            <Badge
              variant="outline"
              className={cn(
                "mt-1 h-6 rounded-full px-2 text-[10px] font-semibold",
                getTechnicalComplianceClass(
                  submission.technicalOffer.complianceStatus,
                ),
              )}
            >
              {getTechnicalComplianceLabel(
                submission.technicalOffer.complianceStatus,
              )}
            </Badge>

            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Observations
            </p>
            <p className="mt-1 text-slate-700">
              {submission.technicalOffer.observations}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Offre financiere
          </h2>
        </header>

        {submission.financialOffer.decryptedAt ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Montant HT
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {formatAmount(submission.financialOffer.amountHt)}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Montant TTC
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {formatAmount(submission.financialOffer.amountTtc)}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                TVA
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {submission.financialOffer.vatPercent}%
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Date dechiffrement
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {formatDateTime(submission.financialOffer.decryptedAt, locale)}
              </p>
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-700">
            Offre financiere non visible: chiffree en attente de phase de
            dechiffrement.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Caution</h2>
        </header>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Montant
            </p>
            <p className="mt-1 text-slate-800">
              {formatAmount(submission.caution.amount)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Banque
            </p>
            <p className="mt-1 text-slate-800">{submission.caution.bankName}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Reference
            </p>
            <p className="mt-1 text-slate-800">
              {submission.caution.reference}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Date emission
            </p>
            <p className="mt-1 text-slate-800">
              {submission.caution.issueDate === "-"
                ? "-"
                : formatDate(submission.caution.issueDate, locale)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Date expiration
            </p>
            <p className="mt-1 text-slate-800">
              {submission.caution.expirationDate === "-"
                ? "-"
                : formatDate(submission.caution.expirationDate, locale)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Statut
            </p>
            <Badge
              variant="outline"
              className={cn(
                "mt-1 h-6 rounded-full px-2 text-[10px] font-semibold",
                getCautionStatusClass(submission.caution.status),
              )}
            >
              {getCautionStatusLabel(submission.caution.status)}
            </Badge>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Pieces admin</h2>
        </header>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold text-slate-600">
                <th className="px-3 py-2">Document</th>
                <th className="px-3 py-2">Statut validation</th>
                <th className="px-3 py-2">Observations</th>
              </tr>
            </thead>
            <tbody>
              {submission.administrativeDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-slate-100 text-xs text-slate-700"
                >
                  <td className="px-3 py-2">{doc.label}</td>
                  <td className="px-3 py-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-6 rounded-full px-2 text-[10px] font-semibold",
                        getAdministrativeStatusClass(doc.validationStatus),
                      )}
                    >
                      {getAdministrativeStatusLabel(doc.validationStatus)}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">{doc.observations || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
