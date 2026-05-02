"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Paperclip, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  resubmitServiceContractantGreAGreRequest,
  submitServiceContractantGreAGreRequest,
  type GreAGreJustificationPayload,
  type GreAGreJustificationType,
  type ServiceContractantGreAGreRequestDetail,
} from "@/services/greAGre";

interface GreAGreRequestFormProps {
  locale: string;
  mode?: "create" | "resubmit";
  requestId?: string;
  initialData?: ServiceContractantGreAGreRequestDetail | null;
  dict?: any;
}

interface MainFormErrors {
  object?: string;
  description?: string;
  estimatedAmount?: string;
  justifications?: string;
}

interface JustificationFormErrors {
  description?: string;
  order?: string;
}

interface JustificationDraft {
  id: string;
  type: GreAGreJustificationType;
  description: string;
  fileName?: string;
  order: number;
}

function getNextOrder(items: JustificationDraft[]) {
  if (items.length === 0) {
    return 1;
  }

  return Math.max(...items.map((item) => item.order)) + 1;
}

function generateReference() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(100 + Math.random() * 900);
  return `GAG-${year}-${month}${day}-${rand}`;
}

const justificationTypeOptions: Array<{
  value: GreAGreJustificationType;
  label: string;
}> = [
  { value: "urgence", label: "Urgence" },
  { value: "technique", label: "Technique" },
  { value: "economique", label: "Economique" },
  { value: "juridique", label: "Juridique" },
  { value: "autre", label: "Autre" },
];

function getJustificationTypeLabel(type: GreAGreJustificationType, dict?: any) {
  const defaultLabel = justificationTypeOptions.find((item) => item.value === type)?.label || type;
  if (!dict?.justificationTypes) return defaultLabel;
  return dict.justificationTypes[type] || defaultLabel;
}

export default function GreAGreRequestForm({
  locale,
  mode = "create",
  requestId,
  initialData,
  dict,
}: GreAGreRequestFormProps) {
  const router = useRouter();
  const isResubmitMode = mode === "resubmit";
  const canResubmit = isResubmitMode && Boolean(requestId);

  const initialJustifications: JustificationDraft[] = (
    initialData?.justifications || []
  )
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({
      id: `justification-initial-${index + 1}`,
      type: item.type,
      description: item.description,
      fileName: item.fileName,
      order: item.order,
    }));

  const [reference] = useState(initialData?.reference || generateReference);
  const [object, setObject] = useState(initialData?.object || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [estimatedAmount, setEstimatedAmount] = useState(
    initialData?.estimatedAmount || "",
  );

  const [justificationType, setJustificationType] =
    useState<GreAGreJustificationType>("urgence");
  const [justificationDescription, setJustificationDescription] = useState("");
  const [justificationFileName, setJustificationFileName] = useState("");
  const [justificationOrder, setJustificationOrder] = useState(
    getNextOrder(initialJustifications),
  );
  const [justificationFileInputKey, setJustificationFileInputKey] = useState(0);
  const [justifications, setJustifications] = useState<JustificationDraft[]>(
    initialJustifications,
  );

  const [mainErrors, setMainErrors] = useState<MainFormErrors>({});
  const [justificationErrors, setJustificationErrors] =
    useState<JustificationFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const listHref = useMemo(
    () => `/${locale}/dashboard/contractant/gre-a-gre`,
    [locale],
  );

  const inputClass = (error?: string) =>
    cn(
      "h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-[#4CAF50]",
      error ? "border-red-300 bg-red-50" : "border-slate-200 bg-white",
    );

  const validateMainForm = (): boolean => {
    const errors: MainFormErrors = {};

    if (!object.trim()) {
      errors.object = dict?.errors?.object || "L'objet est obligatoire.";
    }

    if (!description.trim()) {
      errors.description = dict?.errors?.description || "La description est obligatoire.";
    }

    if (!estimatedAmount.trim()) {
      errors.estimatedAmount = dict?.errors?.amount || "Le montant estime est obligatoire.";
    }

    if (justifications.length === 0) {
      errors.justifications = dict?.errors?.emptyJustifications || "Ajoutez au moins une justification.";
    }

    setMainErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addJustification = () => {
    const errors: JustificationFormErrors = {};

    if (!justificationDescription.trim()) {
      errors.description =
        dict?.errors?.justificationDesc || "La description de la justification est obligatoire.";
    }

    if (!Number.isFinite(justificationOrder) || justificationOrder <= 0) {
      errors.order = dict?.errors?.justificationOrder || "L'ordre doit etre un nombre superieur a 0.";
    } else if (
      justifications.some((item) => item.order === justificationOrder)
    ) {
      errors.order = dict?.errors?.justificationOrderDuplicate || "Cet ordre est deja utilise. Choisissez un ordre unique.";
    }

    setJustificationErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setJustifications((current) => {
      const next = [
        ...current,
        {
          id: `justification-${Date.now()}-${current.length + 1}`,
          type: justificationType,
          description: justificationDescription.trim(),
          fileName: justificationFileName || undefined,
          order: justificationOrder,
        },
      ];

      return next.sort((a, b) => a.order - b.order);
    });

    const predictedNext = [
      ...justifications,
      {
        id: "preview",
        type: justificationType,
        description: justificationDescription.trim(),
        fileName: justificationFileName || undefined,
        order: justificationOrder,
      },
    ];

    setJustificationDescription("");
    setJustificationFileName("");
    setJustificationOrder(getNextOrder(predictedNext));
    setJustificationFileInputKey((prev) => prev + 1);
    setJustificationErrors({});
    setMainErrors((current) => ({ ...current, justifications: undefined }));
  };

  const removeJustification = (id: string) => {
    setJustifications((current) => {
      const filtered = current
        .filter((item) => item.id !== id)
        .sort((a, b) => a.order - b.order)
        .map((item, index) => ({ ...item, order: index + 1 }));

      setJustificationOrder(getNextOrder(filtered));
      return filtered;
    });
  };

  const moveJustification = (id: string, direction: "up" | "down") => {
    setJustifications((current) => {
      const sorted = [...current].sort((a, b) => a.order - b.order);
      const currentIndex = sorted.findIndex((item) => item.id === id);

      if (currentIndex < 0) {
        return current;
      }

      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= sorted.length) {
        return current;
      }

      [sorted[currentIndex], sorted[targetIndex]] = [
        sorted[targetIndex],
        sorted[currentIndex],
      ];

      return sorted.map((item, index) => ({ ...item, order: index + 1 }));
    });
  };

  const submitRequest = async () => {
    if (!validateMainForm()) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    const payload: {
      reference: string;
      object: string;
      description: string;
      estimatedAmount: string;
      justifications: GreAGreJustificationPayload[];
    } = {
      reference,
      object: object.trim(),
      description: description.trim(),
      estimatedAmount: estimatedAmount.trim(),
      justifications: justifications
        .map((item) => ({
          type: item.type,
          description: item.description,
          fileName: item.fileName,
          order: item.order,
        }))
        .sort((a, b) => a.order - b.order),
    };

    try {
      const created =
        canResubmit && requestId
          ? await resubmitServiceContractantGreAGreRequest(requestId, payload)
          : await submitServiceContractantGreAGreRequest(payload);
      router.push(`/${locale}/dashboard/contractant/gre-a-gre/${created.id}`);
      router.refresh();
    } catch {
      setSubmitError(
        canResubmit
          ? dict?.errors?.resubmitError || "Impossible de resoumettre la demande pour le moment."
          : dict?.errors?.submitError || "Impossible de soumettre la demande pour le moment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-2xl font-bold text-slate-900">
          {canResubmit
            ? dict?.titleResubmit || "Modifier et resoumettre la demande"
            : dict?.titleCreate || "Informations de la demande"}
        </h2>
        <p className="text-xs text-slate-500">
          {canResubmit
            ? dict?.subtitleResubmit || "Mettez a jour les informations puis resoumettez la demande apres correction."
            : dict?.subtitleCreate || "Completez les champs puis ajoutez les justifications."}
        </p>
      </div>

      {submitError && (
        <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
          {submitError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            {dict?.reference || "Reference (auto)"}
          </label>
          <input
            value={reference}
            readOnly
            className="h-10 w-full rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            {dict?.estimatedAmount || "Montant estime (DZD)"}
          </label>
          <input
            value={estimatedAmount}
            onChange={(event) => setEstimatedAmount(event.target.value)}
            placeholder="Ex. 8 500 000"
            className={inputClass(mainErrors.estimatedAmount)}
          />
          {mainErrors.estimatedAmount && (
            <p className="mt-1 text-[11px] text-red-600">
              {mainErrors.estimatedAmount}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            {dict?.object || "Objet"}
          </label>
          <input
            value={object}
            onChange={(event) => setObject(event.target.value)}
            placeholder="Ex. Intervention urgente sur infrastructure critique"
            className={inputClass(mainErrors.object)}
          />
          {mainErrors.object && (
            <p className="mt-1 text-[11px] text-red-600">{mainErrors.object}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            {dict?.description || "Description"}
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Detaillez le contexte et le besoin de la demande Gre a Gre..."
            className={cn(
              "w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-[#4CAF50]",
              mainErrors.description
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-white",
            )}
          />
          {mainErrors.description && (
            <p className="mt-1 text-[11px] text-red-600">
              {mainErrors.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-700">{dict?.justificationsTitle || "Justifications"}</p>
          <span className="text-[11px] text-slate-500">
            {justifications.length} {dict?.addedLabel || "ajoutee(s)"}
          </span>
        </div>

        <p className="mb-3 text-[11px] text-slate-500">
          {dict?.justificationsSubtitle || "Ajoutez des justifications claires et ordonnees pour appuyer la demande."}
        </p>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <p className="mb-3 text-sm font-semibold text-slate-800">
            {dict?.addJustification || "Ajouter une justification"}
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-[11px] text-slate-600">
                {dict?.type || "Type"}
              </label>
              <select
                value={justificationType}
                onChange={(event) =>
                  setJustificationType(
                    event.target.value as GreAGreJustificationType,
                  )
                }
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs outline-none focus:border-[#4CAF50]"
              >
                {justificationTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] text-slate-600">
                {dict?.description || "Description"}
              </label>
              <input
                value={justificationDescription}
                onChange={(event) =>
                  setJustificationDescription(event.target.value)
                }
                placeholder="Expliquez la justification"
                className={cn(
                  "h-9 w-full rounded-md border px-3 text-xs outline-none focus:border-[#4CAF50]",
                  justificationErrors.description
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 bg-white",
                )}
              />
              {justificationErrors.description && (
                <p className="mt-1 text-[11px] text-red-600">
                  {justificationErrors.description}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-[11px] text-slate-600">
                {dict?.order || "Ordre"}
              </label>
              <input
                type="number"
                min={1}
                value={justificationOrder}
                onChange={(event) =>
                  setJustificationOrder(
                    Number.parseInt(event.target.value || "1", 10),
                  )
                }
                className={cn(
                  "h-9 w-full rounded-md border px-3 text-xs outline-none focus:border-[#4CAF50]",
                  justificationErrors.order
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 bg-white",
                )}
              />
              {justificationErrors.order && (
                <p className="mt-1 text-[11px] text-red-600">
                  {justificationErrors.order}
                </p>
              )}
            </div>

            <div className="md:col-span-3">
              <label className="mb-1 block text-[11px] text-slate-600">
                {dict?.fileOptional || "Fichier joint (optionnel)"}
              </label>
              <input
                key={justificationFileInputKey}
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setJustificationFileName(file?.name || "");
                }}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs file:me-2 file:rounded file:border-0 file:bg-slate-200 file:px-2 file:py-1 file:text-[11px]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={addJustification}
                className="inline-flex h-9 w-full items-center justify-center gap-1 rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95"
              >
                <Plus className="h-3.5 w-3.5" />
                {dict?.addBtn || "Ajouter"}
              </button>
            </div>
          </div>

          {justificationFileName && (
            <p className="mt-2 inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
              <Paperclip className="h-3 w-3" />
              {justificationFileName}
            </p>
          )}
        </div>

        <div className="mt-3 overflow-x-auto rounded-md border border-slate-200 bg-white">
          <table className="w-full min-w-[680px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[11px] font-semibold text-slate-500">
                <th className="px-2 py-2">{dict?.tableHeaders?.order || "Ordre"}</th>
                <th className="px-2 py-2">{dict?.tableHeaders?.type || "Type"}</th>
                <th className="px-2 py-2">{dict?.tableHeaders?.description || "Description"}</th>
                <th className="px-2 py-2">{dict?.tableHeaders?.file || "Fichier"}</th>
                <th className="px-2 py-2 text-right">{dict?.tableHeaders?.actions || "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {justifications.length === 0 ? (
                <tr className="text-xs text-slate-500">
                  <td colSpan={5} className="px-2 py-4 text-center">
                    {dict?.emptyJustifications || "Aucune justification ajoutee."}
                  </td>
                </tr>
              ) : (
                justifications.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 text-xs text-slate-700"
                  >
                    <td className="px-2 py-2">{item.order}</td>
                    <td className="px-2 py-2 font-semibold text-[#2F9E44]">
                      {getJustificationTypeLabel(item.type, dict)}
                    </td>
                    <td className="px-2 py-2">{item.description}</td>
                    <td className="px-2 py-2">{item.fileName || "-"}</td>
                    <td className="px-2 py-2 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveJustification(item.id, "up")}
                          className="inline-flex items-center rounded p-1 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={index === 0}
                          aria-label={dict?.moveUp || "Monter"}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveJustification(item.id, "down")}
                          className="inline-flex items-center rounded p-1 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={index === justifications.length - 1}
                          aria-label={dict?.moveDown || "Descendre"}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeJustification(item.id)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {dict?.delete || "Supprimer"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {mainErrors.justifications && (
          <p className="mt-2 text-[11px] text-red-600">
            {mainErrors.justifications}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col-reverse gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => router.push(listHref)}
          className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          {dict?.backBtn || "Retour"}
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => {
            void submitRequest();
          }}
          className="inline-flex h-9 items-center justify-center rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? canResubmit
              ? dict?.resubmittingBtn || "Resoumission..."
              : dict?.submittingBtn || "Soumission..."
            : canResubmit
              ? dict?.resubmitBtn || "Modifier et resoumettre"
              : dict?.submitBtn || "Soumettre la demande"}
        </button>
      </div>
    </section>
  );
}
