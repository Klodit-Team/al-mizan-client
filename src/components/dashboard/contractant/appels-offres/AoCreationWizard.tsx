"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Step1 from "./ao-steps/Step1";
import Step2 from "./ao-steps/Step2";
import Step3 from "./ao-steps/Step3";
import Step4 from "./ao-steps/Step4";
import Step5 from "./ao-steps/Step5";
import Step6 from "./ao-steps/Step6";
import AoWizardHeader from "@/components/dashboard/contractant/appels-offres/AoWizardHeader";
import {
  getServiceContractantTenderDraftById,
  publishServiceContractantTender,
  saveServiceContractantTenderDraft,
  type SaveTenderDraftPayload,
} from "@/services/tenders";
import { useGenerateCdcDraftMutation } from "@/services/contractant-tenders/queries";

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface GeneralInfoForm {
  reference: string;
  object: string;
  description: string;
  marketType: string;
  procedureType: string;
  estimatedAmount: string;
  executionWilaya: string;
  executionDelayDays: string;
  submissionBondRequired: boolean;
  submissionBondAmount: string;
  dceDeadline: string;
  offerDeadline: string;
  openingDate: string;
}

export interface LotItem {
  id: string;
  lotNumber: string;
  designation: string;
  description: string;
  estimatedAmount: string;
  delayDays: string;
}

export interface LotEditorForm {
  lotNumber: string;
  designation: string;
  description: string;
  estimatedAmount: string;
  delayDays: string;
}

export interface CdcForm {
  title: string;
  version: string;
  withdrawalPrice: string;
  isPublished: boolean;
}

export interface EligibilityCriterion {
  id: string;
  order: number;
  designation: string;
  description: string;
  eliminatory: boolean;
}

export interface CriterionForm {
  designation: string;
  description: string;
  eliminatory: boolean;
}

export type EvaluationType = "technique" | "financier";

export interface EvaluationCriterion {
  id: string;
  order: number;
  designation: string;
  type: EvaluationType;
  weighting: string;
  eliminationScore: string;
  lotAssignment: string;
}

export interface EvaluationCriterionForm {
  designation: string;
  type: EvaluationType;
  weighting: string;
  eliminationScore: string;
  lotAssignment: string;
}

export interface AoCreationDict {
  createTitle: string;
  stepPrefix: string;
  stepOn: string;
  stepTitles: string[];
  buttons: {
    next: string;
    back: string;
    saveDraft: string;
    saveAsDraft: string;
    publishAo: string;
    publishCdc: string;
    uploadFile: string;
    replaceFile: string;
    downloadCdc: string;
    cancel: string;
  };
  review: {
    title: string;
    subtitle: string;
    validationChecks: string;
    generalInfo: string;
    statusPublished: string;
    statusUnpublished: string;
  };
  messages: {
    draftSaved: string;
    publishBlockedPrefix: string;
    publishSuccessPrefix: string;
  };
  header: {
    breadcrumbDashboard: string;
    breadcrumbAo: string;
    editModeLabel: string;
    progression: string;
  };
  validation: {
    required: string;
    offerDeadlineAfterDce: string;
    openingDateAfterOffer: string;
    weightingInvalid: string;
    eliminationScoreRange: string;
    fileTooLarge: string;
    pdfOnly: string;
    cdcFileRequired: string;
    addEvaluationCriterion: string;
    totalWeightMustBe100: string;
  };
  errors: {
    draftSaveFailed: string;
    publishFailed: string;
    loadDraftFailed: string;
  };
  step1: {
    referenceLabel: string;
    objectLabel: string;
    objectPlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    marketTypeLabel: string;
    marketTypePlaceholder: string;
    marketTypes: {
      fournitures: string;
      services: string;
      travaux: string;
    };
    procedureTypeLabel: string;
    procedureTypePlaceholder: string;
    procedureTypes: {
      ouvert: string;
      restreint: string;
      greAgre: string;
    };
    estimatedAmountLabel: string;
    wilayaLabel: string;
    wilayaPlaceholder: string;
    executionDelayLabel: string;
    executionDelayPlaceholder: string;
    submissionBondTitle: string;
    submissionBondAmountLabel: string;
    submissionBondPlaceholder: string;
    deadlinesTitle: string;
    dceDeadlineLabel: string;
    offerDeadlineLabel: string;
    openingDateLabel: string;
  };
  step2: {
    title: string;
    subtitle: string;
    addLotBtn: string;
    columns: {
      number: string;
      designation: string;
      description: string;
      estimatedAmount: string;
      delay: string;
      actions: string;
    };
    emptyMessage: string;
    editLotTitle: string;
    newLotTitle: string;
    lotNumberLabel: string;
    designationLabel: string;
    designationPlaceholder: string;
    delayLabel: string;
    delayPlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    estimatedAmountLabel: string;
    saveLotBtn: string;
    daysUnit: string;
  };
  step3: {
    aiTitle: string;
    aiDescription: string;
    aiButton: string;
    cdcTitleLabel: string;
    cdcFileLabel: string;
    uploadDropLabel: string;
    uploadHint: string;
    versionLabel: string;
    withdrawalPriceLabel: string;
    cdcStatusLabel: string;
    fileAlreadySaved: string;
  };
  step4: {
    title: string;
    subtitle: string;
    addCriterionBtn: string;
    columns: {
      order: string;
      designation: string;
      description: string;
      eliminatory: string;
      actions: string;
    };
    emptyMessage: string;
    editCriterionTitle: string;
    newCriterionTitle: string;
    designationLabel: string;
    designationPlaceholder: string;
    eliminatoryLabel: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    saveBtn: string;
    minCriterionWarning: string;
  };
  step5: {
    tabTechnical: string;
    tabFinancial: string;
    criteriaListTitle: string;
    addCriterionBtn: string;
    columns: {
      order: string;
      designation: string;
      type: string;
      lot: string;
      weighting: string;
      eliminationScore: string;
      actions: string;
    };
    emptyMessage: string;
    editCriterionTitle: string;
    newCriterionTitle: string;
    designationLabel: string;
    designationPlaceholder: string;
    typeLabel: string;
    typeOptions: {
      technique: string;
      financier: string;
    };
    weightingLabel: string;
    weightingPlaceholder: string;
    eliminationScoreLabel: string;
    eliminationScorePlaceholder: string;
    lotLabel: string;
    lotPlaceholder: string;
    saveBtn: string;
    totalWeightTitle: string;
    totalWeightDescription: string;
    validated: string;
    overflow: string;
    remaining: string;
    activeTabWeight: string;
    requirementTitle: string;
    requirementDescription: string;
    quickStatsTitle: string;
    technicalGroups: string;
    financialGroups: string;
    assignedLots: string;
  };
  step6: {
    editBtn: string;
    reviewLabels: {
      aoName: string;
      category: string;
      duration: string;
      estimatedValue: string;
    };
    lotsTitle: string;
    lotsColumns: {
      lotId: string;
      description: string;
      quantityDelay: string;
    };
    lotsEmpty: string;
    scoringTitle: string;
    scoringEmpty: string;
    totalWeighting: string;
    eligibilityTitle: string;
    eligibilityCriteria: string;
    eliminatoryRules: string;
    checks: {
      generalInfoTitle: string;
      generalInfoDesc: string;
      lotsTitle: string;
      lotsDesc: string;
      cdcTitle: string;
      cdcDesc: string;
      weightTitle: string;
      weightDesc: string;
      datesTitle: string;
      datesDesc: string;
      eligibilityTitle: string;
      eligibilityDesc: string;
    };
    cdcDocTitle: string;
    cdcNoFile: string;
    versionLabel: string;
    avisGenerated: string;
  };
  footer: string;
  blockingReasons: {
    generalInfoIncomplete: string;
    noLots: string;
    cdcNotUploaded: string;
    weightInvalid: string;
    noEligibility: string;
    datesIncoherent: string;
  };
}

export interface WizardInitialDraft extends SaveTenderDraftPayload {
  id?: string;
}

interface AoCreationWizardProps {
  dict: AoCreationDict;
  mode?: "create" | "edit";
  title?: string;
  tenderId?: string;
  initialDraft?: WizardInitialDraft | null;
}

const DEFAULT_STEP_TITLES = [
  "Informations Generales",
  "Lots",
  "CDC",
  "Eligibilite",
  "Evaluation",
  "Revision et Publication",
] as const;

function initialReference() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AO-${year}-${month}${day}-${rand}`;
}

function getNextLotNumber(items: LotItem[]) {
  const maxNumber = items.reduce((max, item) => {
    const parsed = Number.parseInt(item.lotNumber, 10);
    if (Number.isNaN(parsed)) {
      return max;
    }
    return Math.max(max, parsed);
  }, 0);

  return String(maxNumber + 1).padStart(2, "0");
}

function generateAvisReference() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const seq = Math.floor(100 + Math.random() * 900);
  return `AVIS-${year}${month}${day}-${seq}`;
}

function parseNumericInput(value: string) {
  const normalized = value.replace(",", ".").trim();
  if (!normalized) {
    return Number.NaN;
  }

  return Number.parseFloat(normalized);
}

export default function AoCreationWizard({
  dict,
  mode = "create",
  title,
  tenderId,
  initialDraft,
}: AoCreationWizardProps) {
  const router = useRouter();
  const params = useParams();
  const locale =
    typeof params?.locale === "string"
      ? params.locale
      : Array.isArray(params?.locale)
        ? params.locale[0]
        : "fr";
  const isRtl = locale === "ar";
  const stepTitles =
    dict.stepTitles.length === 6
      ? (dict.stepTitles as readonly string[])
      : DEFAULT_STEP_TITLES;
  const pageTitle = title || dict.createTitle;
  const isEditMode = mode === "edit";

  const getSwitchThumbClass = (isEnabled: boolean) =>
    isRtl
      ? isEnabled
        ? "-translate-x-5"
        : "translate-x-0"
      : isEnabled
        ? "translate-x-5"
        : "translate-x-0";

  const [step, setStep] = useState<WizardStep>(1);
  const [errors, setErrors] = useState<
    Partial<Record<keyof GeneralInfoForm, string>>
  >({});
  const [savedDraft, setSavedDraft] = useState(false);
  const [lotErrors, setLotErrors] = useState<
    Partial<Record<keyof LotEditorForm, string>>
  >({});
  const [cdcErrors, setCdcErrors] = useState<
    Partial<Record<keyof CdcForm | "file", string>>
  >({});
  const [criterionErrors, setCriterionErrors] = useState<
    Partial<Record<keyof CriterionForm, string>>
  >({});
  const [evaluationErrors, setEvaluationErrors] = useState<
    Partial<Record<keyof EvaluationCriterionForm, string>>
  >({});
  const [showLotForm, setShowLotForm] = useState(false);
  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [cdcFile, setCdcFile] = useState<File | null>(null);
  const [existingCdcFileName, setExistingCdcFileName] = useState<string | null>(
    () => initialDraft?.cdc.fileName || null,
  );
  const [showCriterionForm, setShowCriterionForm] = useState(false);
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(
    null,
  );
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [editingEvaluationId, setEditingEvaluationId] = useState<string | null>(
    null,
  );
  const [evaluationTab, setEvaluationTab] =
    useState<EvaluationType>("technique");
  const [evaluationStepError, setEvaluationStepError] = useState<string | null>(
    null,
  );
  const [aoStatus, setAoStatus] = useState<"BROUILLON" | "PUBLIE">("BROUILLON");
  const [draftId, setDraftId] = useState<string | undefined>(
    () => initialDraft?.id || tenderId,
  );
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [generatedAvisRef, setGeneratedAvisRef] = useState<string | null>(null);
  const [reviewActionMessage, setReviewActionMessage] = useState<string | null>(
    null,
  );
  const [reviewActionError, setReviewActionError] = useState<string | null>(
    null,
  );
  const [draftHydratedFromApi, setDraftHydratedFromApi] = useState(
    Boolean(initialDraft),
  );

  const generateCdcDraftMutation = useGenerateCdcDraftMutation();

  const [lots, setLots] = useState<LotItem[]>(() =>
    (initialDraft?.lots || []).map((item, index) => ({
      id: `lot-${index + 1}`,
      lotNumber: item.lotNumber,
      designation: item.designation,
      description: item.description,
      estimatedAmount: item.estimatedAmount,
      delayDays: item.delayDays,
    })),
  );

  const [lotForm, setLotForm] = useState<LotEditorForm>({
    lotNumber: "",
    designation: "",
    description: "",
    estimatedAmount: "",
    delayDays: "",
  });

  const [cdcForm, setCdcForm] = useState<CdcForm>(() => ({
    title: initialDraft?.cdc.title || "",
    version: initialDraft?.cdc.version || "v1.0.0",
    withdrawalPrice: initialDraft?.cdc.withdrawalPrice || "0.00",
    isPublished: initialDraft?.cdc.isPublished || false,
  }));

  const [criteria, setCriteria] = useState<EligibilityCriterion[]>(() =>
    initialDraft?.eligibilityCriteria?.length
      ? initialDraft.eligibilityCriteria.map((item, index) => ({
        id: `criterion-${index + 1}`,
        order: item.order || index + 1,
        designation: item.designation,
        description: item.description,
        eliminatory: item.eliminatory,
      }))
      : [
        {
          id: "criterion-1",
          order: 1,
          designation: "Capacite Financiere",
          description:
            "Chiffre d'affaires annuel minimum de 1M MAD sur les 3 dernieres annees.",
          eliminatory: true,
        },
        {
          id: "criterion-2",
          order: 2,
          designation: "Experience Similaire",
          description:
            "Realisation d'au moins 3 projets de nature et d'envergure similaires.",
          eliminatory: true,
        },
        {
          id: "criterion-3",
          order: 3,
          designation: "Certifications ISO",
          description:
            "Possession d'une certification ISO 9001:2015 en cours de validite.",
          eliminatory: false,
        },
      ],
  );

  const [criterionForm, setCriterionForm] = useState<CriterionForm>({
    designation: "",
    description: "",
    eliminatory: true,
  });

  const [evaluationCriteria, setEvaluationCriteria] = useState<
    EvaluationCriterion[]
  >(() =>
    initialDraft?.evaluationCriteria?.length
      ? initialDraft.evaluationCriteria.map((item, index) => ({
        id: `evaluation-${index + 1}`,
        order: item.order || index + 1,
        designation: item.designation,
        type: item.type,
        weighting: item.weighting,
        eliminationScore: item.eliminationScore,
        lotAssignment: item.lotAssignment,
      }))
      : [
        {
          id: "evaluation-1",
          order: 1,
          designation: "Technical Capacity & Experience",
          type: "technique",
          weighting: "40",
          eliminationScore: "25",
          lotAssignment: "Lot 01",
        },
        {
          id: "evaluation-2",
          order: 2,
          designation: "Methodology & Work Plan",
          type: "technique",
          weighting: "30",
          eliminationScore: "20",
          lotAssignment: "All Lots",
        },
        {
          id: "evaluation-3",
          order: 3,
          designation: "Key Personnel Qualifications",
          type: "technique",
          weighting: "30",
          eliminationScore: "",
          lotAssignment: "Lot 01",
        },
      ],
  );

  const [evaluationForm, setEvaluationForm] = useState<EvaluationCriterionForm>(
    {
      designation: "",
      type: "technique",
      weighting: "",
      eliminationScore: "",
      lotAssignment: "",
    },
  );

  const [form, setForm] = useState<GeneralInfoForm>(() => ({
    reference: initialDraft?.reference || initialReference(),
    object: initialDraft?.object || "",
    description: initialDraft?.description || "",
    marketType: initialDraft?.marketType || "",
    procedureType: initialDraft?.procedureType || "",
    estimatedAmount: initialDraft?.estimatedAmount || "",
    executionWilaya: initialDraft?.executionWilaya || "",
    executionDelayDays: initialDraft?.executionDelayDays || "",
    submissionBondRequired: initialDraft?.submissionBondRequired ?? true,
    submissionBondAmount: initialDraft?.submissionBondAmount || "",
    dceDeadline: initialDraft?.dceDeadline || "",
    offerDeadline: initialDraft?.offerDeadline || "",
    openingDate: initialDraft?.openingDate || "",
  }));

  useEffect(() => {
    if (!isEditMode || !tenderId || draftHydratedFromApi) {
      return;
    }

    let isMounted = true;

    const loadDraft = async () => {
      try {
        const draft = await getServiceContractantTenderDraftById(tenderId);
        if (!draft || !isMounted) {
          return;
        }

        setDraftId(draft.id);
        setForm({
          reference: draft.reference || initialReference(),
          object: draft.object || "",
          description: draft.description || "",
          marketType: draft.marketType || "",
          procedureType: draft.procedureType || "",
          estimatedAmount: draft.estimatedAmount || "",
          executionWilaya: draft.executionWilaya || "",
          executionDelayDays: draft.executionDelayDays || "",
          submissionBondRequired: draft.submissionBondRequired ?? true,
          submissionBondAmount: draft.submissionBondAmount || "",
          dceDeadline: draft.dceDeadline || "",
          offerDeadline: draft.offerDeadline || "",
          openingDate: draft.openingDate || "",
        });

        setCdcForm({
          title: draft.cdc.title || "",
          version: draft.cdc.version || "v1.0.0",
          withdrawalPrice: draft.cdc.withdrawalPrice || "0.00",
          isPublished: draft.cdc.isPublished || false,
        });

        setExistingCdcFileName(draft.cdc.fileName || null);

        setLots(
          (draft.lots || []).map((item, index) => ({
            id: `lot-${index + 1}`,
            lotNumber: item.lotNumber,
            designation: item.designation,
            description: item.description,
            estimatedAmount: item.estimatedAmount,
            delayDays: item.delayDays,
          })),
        );

        setCriteria(
          (draft.eligibilityCriteria || []).map((item, index) => ({
            id: `criterion-${index + 1}`,
            order: item.order || index + 1,
            designation: item.designation,
            description: item.description,
            eliminatory: item.eliminatory,
          })),
        );

        setEvaluationCriteria(
          (draft.evaluationCriteria || []).map((item, index) => ({
            id: `evaluation-${index + 1}`,
            order: item.order || index + 1,
            designation: item.designation,
            type: item.type,
            weighting: item.weighting,
            eliminationScore: item.eliminationScore,
            lotAssignment: item.lotAssignment,
          })),
        );

        setDraftHydratedFromApi(true);
      } catch {
        if (isMounted) {
          setReviewActionError("Impossible de charger ce brouillon.");
        }
      }
    };

    void loadDraft();

    return () => {
      isMounted = false;
    };
  }, [draftHydratedFromApi, isEditMode, tenderId]);

  const progressPercent = useMemo(() => ((step - 1) / 5) * 100, [step]);

  const buildDraftPayload = (): SaveTenderDraftPayload => ({
    id: draftId,
    reference: form.reference,
    object: form.object,
    description: form.description,
    marketType: form.marketType,
    procedureType: form.procedureType,
    estimatedAmount: form.estimatedAmount,
    executionWilaya: form.executionWilaya,
    executionDelayDays: form.executionDelayDays,
    submissionBondRequired: form.submissionBondRequired,
    submissionBondAmount: form.submissionBondAmount,
    dceDeadline: form.dceDeadline,
    offerDeadline: form.offerDeadline,
    openingDate: form.openingDate,
    cdc: {
      title: cdcForm.title,
      version: cdcForm.version,
      withdrawalPrice: cdcForm.withdrawalPrice,
      isPublished: cdcForm.isPublished,
      fileName: cdcFile?.name || existingCdcFileName || undefined,
    },
    lots: lots.map((lot) => ({
      lotNumber: lot.lotNumber,
      designation: lot.designation,
      description: lot.description,
      estimatedAmount: lot.estimatedAmount,
      delayDays: lot.delayDays,
    })),
    eligibilityCriteria: criteria.map((criterion) => ({
      order: criterion.order,
      designation: criterion.designation,
      description: criterion.description,
      eliminatory: criterion.eliminatory,
    })),
    evaluationCriteria: evaluationCriteria.map((criterion) => ({
      order: criterion.order,
      designation: criterion.designation,
      type: criterion.type,
      weighting: criterion.weighting,
      eliminationScore: criterion.eliminationScore,
      lotAssignment: criterion.lotAssignment,
    })),
  });

  const technicalCriteriaCount = useMemo(
    () => evaluationCriteria.filter((item) => item.type === "technique").length,
    [evaluationCriteria],
  );

  const getReviewBlockingReasons = () => {
    const reasons: string[] = [];

    if (!reviewChecks.generalInfoComplete) {
      reasons.push(dict.step6.checks.generalInfoTitle);
    }
    if (!reviewChecks.hasLots) {
      reasons.push(dict.step6.checks.lotsTitle);
    }
    if (!reviewChecks.cdcUploaded) {
      reasons.push(dict.step6.checks.cdcTitle);
    }
    if (!reviewChecks.criteriaWeightValid) {
      reasons.push(dict.step6.checks.weightTitle);
    }
    if (!reviewChecks.eligibilityComplete) {
      reasons.push(dict.step6.checks.eligibilityTitle);
    }
    if (!reviewChecks.datesCoherent) {
      reasons.push(dict.step6.checks.datesTitle);
    }

    return reasons;
  };

  const financialCriteriaCount = useMemo(
    () => evaluationCriteria.filter((item) => item.type === "financier").length,
    [evaluationCriteria],
  );

  const totalEvaluationWeight = useMemo(
    () =>
      evaluationCriteria.reduce((sum, item) => {
        const parsed = parseNumericInput(item.weighting);
        return Number.isNaN(parsed) ? sum : sum + parsed;
      }, 0),
    [evaluationCriteria],
  );

  const activeEvaluationCriteria = useMemo(
    () =>
      evaluationCriteria
        .filter((item) => item.type === evaluationTab)
        .sort((a, b) => a.order - b.order),
    [evaluationCriteria, evaluationTab],
  );

  const activeEvaluationWeight = useMemo(
    () =>
      activeEvaluationCriteria.reduce((sum, item) => {
        const parsed = parseNumericInput(item.weighting);
        return Number.isNaN(parsed) ? sum : sum + parsed;
      }, 0),
    [activeEvaluationCriteria],
  );

  const reviewChecks = useMemo(() => {
    const generalInfoComplete =
      !!form.object.trim() &&
      !!form.description.trim() &&
      !!form.marketType &&
      !!form.procedureType &&
      !!form.estimatedAmount.trim() &&
      !!form.executionWilaya.trim() &&
      !!form.executionDelayDays.trim() &&
      !!form.dceDeadline &&
      !!form.offerDeadline &&
      !!form.openingDate &&
      (!form.submissionBondRequired || !!form.submissionBondAmount.trim());

    const datesCoherent =
      !!form.dceDeadline &&
      !!form.offerDeadline &&
      !!form.openingDate &&
      form.dceDeadline <= form.offerDeadline &&
      form.offerDeadline <= form.openingDate;

    const hasLots = lots.length > 0;
    const cdcUploaded = !!cdcFile || !!existingCdcFileName;
    const cdcComplete =
      cdcUploaded &&
      !!cdcForm.title.trim() &&
      !!cdcForm.version.trim() &&
      !!cdcForm.withdrawalPrice.trim();
    const eligibilityComplete = criteria.length > 0;
    const evaluationHasRows = evaluationCriteria.length > 0;
    const criteriaWeightValid = Math.abs(totalEvaluationWeight - 100) <= 0.01;

    return {
      generalInfoComplete,
      datesCoherent,
      hasLots,
      cdcUploaded,
      cdcComplete,
      eligibilityComplete,
      evaluationHasRows,
      criteriaWeightValid,
      allValid:
        generalInfoComplete &&
        datesCoherent &&
        hasLots &&
        cdcComplete &&
        eligibilityComplete &&
        evaluationHasRows &&
        criteriaWeightValid,
    };
  }, [
    cdcFile,
    cdcForm,
    existingCdcFileName,
    criteria.length,
    evaluationCriteria.length,
    form,
    lots.length,
    totalEvaluationWeight,
  ]);

  const scoringSummary = useMemo(
    () =>
      evaluationCriteria
        .slice()
        .sort((a, b) => b.order - a.order)
        .map((item) => ({
          id: item.id,
          label: item.designation,
          weight: Number.parseFloat(item.weighting) || 0,
        })),
    [evaluationCriteria],
  );

  const updateField = <K extends keyof GeneralInfoForm>(
    key: K,
    value: GeneralInfoForm[K],
  ) => {
    setSavedDraft(false);
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateStep1 = () => {
    const nextErrors: Partial<Record<keyof GeneralInfoForm, string>> = {};

    if (!form.object.trim()) {
      nextErrors.object = dict.validation.required;
    }

    if (!form.description.trim()) {
      nextErrors.description = dict.validation.required;
    }

    if (!form.marketType) {
      nextErrors.marketType = dict.validation.required;
    }

    if (!form.procedureType) {
      nextErrors.procedureType = dict.validation.required;
    }

    if (!form.estimatedAmount.trim()) {
      nextErrors.estimatedAmount = dict.validation.required;
    }

    if (!form.executionWilaya.trim()) {
      nextErrors.executionWilaya = dict.validation.required;
    }

    if (!form.executionDelayDays.trim()) {
      nextErrors.executionDelayDays = dict.validation.required;
    }

    if (form.submissionBondRequired && !form.submissionBondAmount.trim()) {
      nextErrors.submissionBondAmount = dict.validation.required;
    }

    if (!form.dceDeadline) {
      nextErrors.dceDeadline = dict.validation.required;
    }

    if (!form.offerDeadline) {
      nextErrors.offerDeadline = dict.validation.required;
    }

    if (!form.openingDate) {
      nextErrors.openingDate = dict.validation.required;
    }

    if (
      form.dceDeadline &&
      form.offerDeadline &&
      form.dceDeadline > form.offerDeadline
    ) {
      nextErrors.offerDeadline = dict.validation.offerDeadlineAfterDce;
    }

    if (
      form.offerDeadline &&
      form.openingDate &&
      form.offerDeadline > form.openingDate
    ) {
      nextErrors.openingDate = dict.validation.openingDateAfterOffer;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNextAfterValidation = async () => {
    if (step === 1) {
      const isValid = validateStep1();
      if (!isValid) {
        return;
      }
    }

    if (step === 3) {
      const isValid = validateStep3();
      if (!isValid) {
        return;
      }
    }

    if (step === 4) {
      const isValid = validateStep4();
      if (!isValid) {
        return;
      }
    }

    if (step === 5) {
      const isValid = validateStep5();
      if (!isValid) {
        return;
      }
    }

    const success = await performSaveDraft();
    if (!success) {
      return;
    }

    setStep((current) => {
      switch (current) {
        case 1:
          return 2;
        case 2:
          return 3;
        case 3:
          return 4;
        case 4:
          return 5;
        case 5:
          return 6;
        case 6:
        default:
          return 6;
      }
    });
  };

  const goBack = () => {
    setStep((current) => {
      switch (current) {
        case 6:
          return 5;
        case 5:
          return 4;
        case 4:
          return 3;
        case 3:
          return 2;
        case 2:
          return 1;
        case 1:
        default:
          return 1;
      }
    });
  };

  const performSaveDraft = async (): Promise<boolean> => {
    setIsSubmittingAction(true);
    try {
      const result = await saveServiceContractantTenderDraft(buildDraftPayload());
      setDraftId(result.id);
      setSavedDraft(true);
      setReviewActionError(null);
      setReviewActionMessage(dict.messages.draftSaved);
      return true;
    } catch (error) {
      console.error("Unable to save AO draft", error);
      setSavedDraft(false);
      setReviewActionMessage(null);
      setReviewActionError(dict.errors.draftSaveFailed);
      return false;
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const saveDraft = () => {
    void performSaveDraft();
  };

  const updateLotField = <K extends keyof LotEditorForm>(
    key: K,
    value: LotEditorForm[K],
  ) => {
    setSavedDraft(false);
    setLotErrors((prev) => ({ ...prev, [key]: undefined }));
    setLotForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateCdcField = <K extends keyof CdcForm>(
    key: K,
    value: CdcForm[K],
  ) => {
    setSavedDraft(false);
    setCdcErrors((prev) => ({ ...prev, [key]: undefined }));
    setCdcForm((prev) => ({ ...prev, [key]: value }));
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    }

    const kb = bytes / 1024;
    return `${Math.max(1, Math.round(kb))} KB`;
  };

  const handleCdcFileChange = (file: File | null) => {
    if (!file) {
      return;
    }

    const maxFileSize = 25 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setCdcErrors((prev) => ({
        ...prev,
        file: dict.validation.fileTooLarge,
      }));
      return;
    }

    const isPdf = file.name.toLowerCase().endsWith(".pdf");
    const isTxt = file.name.toLowerCase().endsWith(".txt");
    
    if (!isPdf && !isTxt) {
      setCdcErrors((prev) => ({
        ...prev,
        file: dict.validation.pdfOnly, // We'll keep the key but the translation says PDF/TXT
      }));
      return;
    }

    setCdcFile(file);
    setExistingCdcFileName(null);
    setCdcErrors((prev) => ({ ...prev, file: undefined }));
  };

  const validateStep3 = () => {
    const nextErrors: Partial<Record<keyof CdcForm | "file", string>> = {};

    if (!cdcForm.title.trim()) {
      nextErrors.title = "Champ obligatoire";
    }

    if (!cdcFile && !existingCdcFileName) {
      nextErrors.file = dict.validation.cdcFileRequired;
    }

    if (!cdcForm.version.trim()) {
      nextErrors.version = dict.validation.required;
    }

    if (!cdcForm.withdrawalPrice.trim()) {
      nextErrors.withdrawalPrice = dict.validation.required;
    }

    setCdcErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStep4 = () => {
    return criteria.length > 0;
  };

  const validateStep5 = () => {
    if (evaluationCriteria.length === 0) {
      setEvaluationStepError(dict.validation.addEvaluationCriterion);
      return false;
    }

    if (Math.abs(totalEvaluationWeight - 100) > 0.01) {
      setEvaluationStepError(
        dict.validation.totalWeightMustBe100,
      );
      return false;
    }

    setEvaluationStepError(null);
    return true;
  };

  const publishCdc = () => {
    updateCdcField("isPublished", true);
  };

  const updateCriterionField = <K extends keyof CriterionForm>(
    key: K,
    value: CriterionForm[K],
  ) => {
    setSavedDraft(false);
    setCriterionErrors((prev) => ({ ...prev, [key]: undefined }));
    setCriterionForm((prev) => ({ ...prev, [key]: value }));
  };

  const normalizeCriterionOrder = (items: EligibilityCriterion[]) =>
    items.map((item, index) => ({ ...item, order: index + 1 }));

  const resetCriterionForm = () => {
    setCriterionForm({
      designation: "",
      description: "",
      eliminatory: true,
    });
    setCriterionErrors({});
    setEditingCriterionId(null);
  };

  const openCreateCriterionForm = () => {
    resetCriterionForm();
    setShowCriterionForm(true);
  };

  const openEditCriterionForm = (criterion: EligibilityCriterion) => {
    setCriterionForm({
      designation: criterion.designation,
      description: criterion.description,
      eliminatory: criterion.eliminatory,
    });
    setCriterionErrors({});
    setEditingCriterionId(criterion.id);
    setShowCriterionForm(true);
  };

  const validateCriterionForm = () => {
    const nextErrors: Partial<Record<keyof CriterionForm, string>> = {};

    if (!criterionForm.designation.trim()) {
      nextErrors.designation = dict.validation.required;
    }

    if (!criterionForm.description.trim()) {
      nextErrors.description = "Champ obligatoire";
    }

    setCriterionErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveCriterion = () => {
    if (!validateCriterionForm()) {
      return;
    }

    setCriteria((current) => {
      if (!editingCriterionId) {
        return [
          ...current,
          {
            id: `criterion-${Date.now()}`,
            order: current.length + 1,
            designation: criterionForm.designation.trim(),
            description: criterionForm.description.trim(),
            eliminatory: criterionForm.eliminatory,
          },
        ];
      }

      return current.map((item) =>
        item.id === editingCriterionId
          ? {
            ...item,
            designation: criterionForm.designation.trim(),
            description: criterionForm.description.trim(),
            eliminatory: criterionForm.eliminatory,
          }
          : item,
      );
    });

    setShowCriterionForm(false);
    resetCriterionForm();
  };

  const cancelCriterionEdit = () => {
    setShowCriterionForm(false);
    resetCriterionForm();
  };

  const deleteCriterion = (id: string) => {
    setCriteria((current) =>
      normalizeCriterionOrder(current.filter((item) => item.id !== id)),
    );

    if (editingCriterionId === id) {
      cancelCriterionEdit();
    }
  };

  const toggleCriterionEliminatory = (id: string) => {
    setCriteria((current) =>
      current.map((item) =>
        item.id === id ? { ...item, eliminatory: !item.eliminatory } : item,
      ),
    );
  };

  const moveCriterion = (id: string, direction: "up" | "down") => {
    setCriteria((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index === -1) {
        return current;
      }

      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) {
        return current;
      }

      const next = [...current];
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return normalizeCriterionOrder(next);
    });
  };

  const updateEvaluationField = <K extends keyof EvaluationCriterionForm>(
    key: K,
    value: EvaluationCriterionForm[K],
  ) => {
    setSavedDraft(false);
    setEvaluationErrors((prev) => ({ ...prev, [key]: undefined }));
    setEvaluationForm((prev) => ({ ...prev, [key]: value }));
  };

  const normalizeEvaluationOrderByType = (items: EvaluationCriterion[]) => {
    const next: EvaluationCriterion[] = [];
    const types: EvaluationType[] = ["technique", "financier"];

    types.forEach((type) => {
      const scoped = items
        .filter((item) => item.type === type)
        .sort((a, b) => a.order - b.order)
        .map((item, index) => ({ ...item, order: index + 1 }));

      next.push(...scoped);
    });

    return next;
  };

  const resetEvaluationForm = () => {
    setEvaluationForm({
      designation: "",
      type: evaluationTab,
      weighting: "",
      eliminationScore: "",
      lotAssignment: "",
    });
    setEvaluationErrors({});
    setEditingEvaluationId(null);
  };

  const openCreateEvaluationForm = () => {
    resetEvaluationForm();
    setShowEvaluationForm(true);
  };

  const openEditEvaluationForm = (criterion: EvaluationCriterion) => {
    setEvaluationForm({
      designation: criterion.designation,
      type: criterion.type,
      weighting: criterion.weighting,
      eliminationScore: criterion.eliminationScore,
      lotAssignment: criterion.lotAssignment,
    });
    setEvaluationErrors({});
    setEditingEvaluationId(criterion.id);
    setShowEvaluationForm(true);
  };

  const validateEvaluationForm = () => {
    const nextErrors: Partial<Record<keyof EvaluationCriterionForm, string>> =
      {};

    if (!evaluationForm.designation.trim()) {
      nextErrors.designation = dict.validation.required;
    }

    if (!evaluationForm.weighting.trim()) {
      nextErrors.weighting = dict.validation.required;
    }

    const weightingValue = parseNumericInput(evaluationForm.weighting);
    if (
      evaluationForm.weighting.trim() &&
      (Number.isNaN(weightingValue) ||
        weightingValue <= 0 ||
        weightingValue > 100)
    ) {
      nextErrors.weighting = dict.validation.weightingInvalid;
    }

    if (evaluationForm.eliminationScore.trim()) {
      const eliminationValue = parseNumericInput(
        evaluationForm.eliminationScore,
      );
      if (
        Number.isNaN(eliminationValue) ||
        eliminationValue < 0 ||
        eliminationValue > 100
      ) {
        nextErrors.eliminationScore = dict.validation.eliminationScoreRange;
      }
    }

    setEvaluationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveEvaluationCriterion = () => {
    if (!validateEvaluationForm()) {
      return;
    }

    setEvaluationCriteria((current) => {
      if (!editingEvaluationId) {
        const scopedCount = current.filter(
          (item) => item.type === evaluationForm.type,
        ).length;

        return [
          ...current,
          {
            id: `evaluation-${Date.now()}`,
            order: scopedCount + 1,
            designation: evaluationForm.designation.trim(),
            type: evaluationForm.type,
            weighting: evaluationForm.weighting.trim(),
            eliminationScore: evaluationForm.eliminationScore.trim(),
            lotAssignment: evaluationForm.lotAssignment.trim(),
          },
        ];
      }

      const currentItem = current.find(
        (item) => item.id === editingEvaluationId,
      );
      const mapped = current.map((item) =>
        item.id === editingEvaluationId
          ? {
            ...item,
            designation: evaluationForm.designation.trim(),
            type: evaluationForm.type,
            weighting: evaluationForm.weighting.trim(),
            eliminationScore: evaluationForm.eliminationScore.trim(),
            lotAssignment: evaluationForm.lotAssignment.trim(),
          }
          : item,
      );

      if (currentItem && currentItem.type !== evaluationForm.type) {
        return normalizeEvaluationOrderByType(mapped);
      }

      return mapped;
    });

    setEvaluationStepError(null);
    setShowEvaluationForm(false);
    resetEvaluationForm();
  };

  const cancelEvaluationEdit = () => {
    setShowEvaluationForm(false);
    resetEvaluationForm();
  };

  const deleteEvaluationCriterion = (id: string) => {
    setEvaluationCriteria((current) =>
      normalizeEvaluationOrderByType(current.filter((item) => item.id !== id)),
    );

    if (editingEvaluationId === id) {
      cancelEvaluationEdit();
    }
  };

  const saveReviewDraft = () => {
    const persistReviewDraft = async () => {
      setIsSubmittingAction(true);
      try {
        const result =
          await saveServiceContractantTenderDraft(buildDraftPayload());
        setAoStatus("BROUILLON");
        setDraftId(result.id);
        setSavedDraft(true);
        setReviewActionError(null);
        setReviewActionMessage(dict.messages.draftSaved);
        router.push(`/${locale}/dashboard/contractant/appels-offres`);
      } catch (error) {
        console.error("Unable to save review draft", error);
        setReviewActionMessage(null);
        setReviewActionError(dict.errors.draftSaveFailed);
      } finally {
        setIsSubmittingAction(false);
      }
    };

    void persistReviewDraft();
  };

  const publishAo = () => {
    if (!reviewChecks.allValid) {
      const reasons = getReviewBlockingReasons();
      setReviewActionMessage(null);
      setReviewActionError(
        `${dict.messages.publishBlockedPrefix} ${reasons.join(" • ")}`,
      );
      return;
    }

    const persistPublish = async () => {
      setIsSubmittingAction(true);
      try {
        const result = await publishServiceContractantTender({
          id: draftId,
          draft: buildDraftPayload(),
          cdcFile: cdcFile,
        });

        const ref = result.avisReference || generateAvisReference();
        setDraftId(result.id);
        setAoStatus("PUBLIE");
        setGeneratedAvisRef(ref);
        setCdcForm((prev) => ({ ...prev, isPublished: true }));
        setReviewActionError(null);
        setReviewActionMessage(`${dict.messages.publishSuccessPrefix} ${ref}`);
        router.push(`/${locale}/dashboard/contractant/appels-offres`);
      } catch (error) {
        console.error("Unable to publish AO", error);
        setReviewActionMessage(null);
        setReviewActionError("Echec de publication de l'AO.");
      } finally {
        setIsSubmittingAction(false);
      }
    };

    void persistPublish();
  };

  const downloadCdcFile = () => {
    if (!cdcFile) {
      return;
    }

    const fileUrl = URL.createObjectURL(cdcFile);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = cdcFile.name;
    link.click();
    URL.revokeObjectURL(fileUrl);
  };

  const resetLotForm = () => {
    setLotForm({
      lotNumber: "",
      designation: "",
      description: "",
      estimatedAmount: "",
      delayDays: "",
    });
    setLotErrors({});
    setEditingLotId(null);
  };

  const openCreateLotForm = () => {
    setLotForm({
      lotNumber: getNextLotNumber(lots),
      designation: "",
      description: "",
      estimatedAmount: "",
      delayDays: "",
    });
    setLotErrors({});
    setEditingLotId(null);
    setShowLotForm(true);
  };

  const openEditLotForm = (lot: LotItem) => {
    setLotForm({
      lotNumber: lot.lotNumber,
      designation: lot.designation,
      description: lot.description,
      estimatedAmount: lot.estimatedAmount,
      delayDays: lot.delayDays,
    });
    setLotErrors({});
    setEditingLotId(lot.id);
    setShowLotForm(true);
  };

  const validateLotForm = () => {
    const nextErrors: Partial<Record<keyof LotEditorForm, string>> = {};

    if (!lotForm.designation.trim()) {
      nextErrors.designation = dict.validation.required;
    }

    if (!lotForm.description.trim()) {
      nextErrors.description = dict.validation.required;
    }

    if (!lotForm.estimatedAmount.trim()) {
      nextErrors.estimatedAmount = dict.validation.required;
    }

    if (!lotForm.delayDays.trim()) {
      nextErrors.delayDays = dict.validation.required;
    }

    setLotErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveLot = () => {
    if (!validateLotForm()) {
      return;
    }

    setLots((current) => {
      if (!editingLotId) {
        return [
          ...current,
          {
            id: `lot-${Date.now()}`,
            lotNumber: getNextLotNumber(current),
            designation: lotForm.designation.trim(),
            description: lotForm.description.trim(),
            estimatedAmount: lotForm.estimatedAmount.trim(),
            delayDays: lotForm.delayDays.trim(),
          },
        ];
      }

      return current.map((item) =>
        item.id === editingLotId
          ? {
            ...item,
            designation: lotForm.designation.trim(),
            description: lotForm.description.trim(),
            estimatedAmount: lotForm.estimatedAmount.trim(),
            delayDays: lotForm.delayDays.trim(),
          }
          : item,
      );
    });

    setShowLotForm(false);
    resetLotForm();
  };

  const cancelLotEdit = () => {
    setShowLotForm(false);
    resetLotForm();
  };

  const deleteLot = (id: string) => {
    setLots((current) => current.filter((item) => item.id !== id));
    if (editingLotId === id) {
      cancelLotEdit();
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editLot = openEditLotForm;
  const triggerCdcFileInput = () => fileInputRef.current?.click();
  const removeCdcFile = () => {
    setCdcFile(null);
    setExistingCdcFileName(null);
  };

  const editCriterion = openEditCriterionForm;
  const moveCriterionUp = (id: string) => moveCriterion(id, "up");
  const moveCriterionDown = (id: string) => moveCriterion(id, "down");

  const editEvaluationCriterion = openEditEvaluationForm;
  const moveEvaluationCriterion = (id: string, direction: "up" | "down") => {
    setEvaluationCriteria((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index === -1) {
        return current;
      }

      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) {
        return current;
      }

      if (current[index].type !== current[target].type) {
        return current;
      }

      const next = [...current];
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return normalizeEvaluationOrderByType(next);
    });
  };
  const moveEvaluationCriterionUp = (id: string) =>
    moveEvaluationCriterion(id, "up");
  const moveEvaluationCriterionDown = (id: string) =>
    moveEvaluationCriterion(id, "down");

  const wizardProps = {
    dict,
    stepTitles,
    getSwitchThumbClass,
    draftId,
    form,
    updateField,
    errors,
    lots,
    setLots,
    lotForm,
    setLotForm,
    showLotForm,
    setShowLotForm,
    editingLotId,
    setEditingLotId,
    saveLot,
    editLot,
    deleteLot,
    lotErrors,
    openCreateLotForm,
    openEditLotForm,
    cancelLotEdit,
    updateLotField,
    cdcForm,
    setCdcForm,
    updateCdcField,
    cdcFile,
    handleCdcFileChange,
    existingCdcFileName,
    setExistingCdcFileName,
    triggerCdcFileInput,
    removeCdcFile,
    cdcErrors,
    formatFileSize,
    publishCdc,
    criteria,
    setCriteria,
    showCriterionForm,
    setShowCriterionForm,
    criterionForm,
    setCriterionForm,
    editingCriterionId,
    setEditingCriterionId,
    saveCriterion,
    editCriterion,
    openEditCriterionForm,
    deleteCriterion,
    cancelCriterionEdit,
    updateCriterionField,
    openCreateCriterionForm,
    toggleCriterionEliminatory,
    moveCriterion,
    moveCriterionUp,
    moveCriterionDown,
    criterionErrors,
    evaluationCriteria,
    setEvaluationCriteria,
    showEvaluationForm,
    setShowEvaluationForm,
    evaluationForm,
    setEvaluationForm,
    editingEvaluationId,
    setEditingEvaluationId,
    evaluationTab,
    setEvaluationTab,
    evaluationErrors,
    saveEvaluationCriterion,
    updateEvaluationField,
    openCreateEvaluationForm,
    editEvaluationCriterion,
    openEditEvaluationForm,
    deleteEvaluationCriterion,
    cancelEvaluationEdit,
    moveEvaluationCriterion,
    moveEvaluationCriterionUp,
    moveEvaluationCriterionDown,
    evaluationStepError,
    setEvaluationStepError,
    goBack,
    goNextAfterValidation,
    isSubmittingAction,
    saveReviewDraft,
    reviewChecks,
    reviewActionError,
    reviewActionMessage,
    generatedAvisRef,
    step,
    isRtl,
    fileInputRef,
    setStep,
    saveDraft,
    publishAo,
    downloadCdcFile,
    savedDraft,
    aoStatus,
    activeEvaluationCriteria,
    technicalCriteriaCount,
    financialCriteriaCount,
    scoringSummary,
    totalEvaluationWeight,
    activeEvaluationWeight,
    generateCdcDraftMutation,
  };

  return (
    <div className="ao-wizard space-y-4">
      <AoWizardHeader
        dict={dict}
        step={step}
        stepPrefix={dict.stepPrefix}
        stepOn={dict.stepOn}
        stepTitles={stepTitles}
        pageTitle={pageTitle}
        isEditMode={isEditMode}
        progressPercent={progressPercent}
      />

      {step === 1 && <Step1 props={wizardProps} />}
      {step === 2 && <Step2 props={wizardProps} />}
      {step === 3 && <Step3 props={wizardProps} />}
      {step === 4 && <Step4 props={wizardProps} />}
      {step === 5 && <Step5 props={wizardProps} />}
      {step === 6 && <Step6 props={wizardProps} />}

      <p className="text-center text-[11px] text-slate-400">
        {dict.footer}
      </p>
    </div>
  );
}
