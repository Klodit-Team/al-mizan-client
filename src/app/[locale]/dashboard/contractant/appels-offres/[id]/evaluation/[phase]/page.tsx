import { notFound } from "next/navigation";

import EvaluationPhaseDetailView from "@/components/dashboard/contractant/appels-offres/evaluation/EvaluationPhaseDetailView";
import {
  getServiceContractantTenderEvaluationPhaseDetail,
  type TenderEvaluationPhase,
} from "@/services/tenderEvaluation";

interface EvaluationPhaseDetailPageProps {
  params: Promise<{ locale: string; id: string; phase: string }>;
}

function isPhase(value: string): value is TenderEvaluationPhase {
  return (
    value === "eligibilite" || value === "technique" || value === "financiere"
  );
}

export default async function EvaluationPhaseDetailPage({
  params,
}: EvaluationPhaseDetailPageProps) {
  const { locale, id, phase } = await params;

  if (!isPhase(phase)) {
    notFound();
  }

  const detail = await getServiceContractantTenderEvaluationPhaseDetail(
    id,
    phase,
  );

  if (!detail) {
    notFound();
  }

  return (
    <EvaluationPhaseDetailView
      locale={locale}
      aoId={id}
      initialDetail={detail}
    />
  );
}
