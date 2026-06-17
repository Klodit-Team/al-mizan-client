"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react";

import {
  publishServiceContractantTenderAvis,
  saveServiceContractantTenderAvisDraft,
  updateServiceContractantTenderAvis,
  getTenderAvisErrorMessage,
  type SaveTenderAvisPayload,
  type TenderAvisItem,
  type TenderAvisSupport,
  type TenderAvisType,
} from "@/services/tendersAvis";
import { cn } from "@/lib/utils";

interface AvisEditorFormProps {
  locale: string;
  aoId: string;
  initialAvis?: TenderAvisItem;
}

type SubmitIntent = "draft" | "publish";

interface AvisFormErrors {
  type?: string;
  title?: string;
  support?: string;
  publicationDate?: string;
  publicationEndDate?: string;
  content?: string;
}

const avisTypeOptions: Array<{ value: TenderAvisType; label: string }> = [
  { value: "ao", label: "AO" },
  { value: "attribution_provisoire", label: "Attribution provisoire" },
  { value: "attribution_definitive", label: "Attribution definitive" },
  { value: "annulation", label: "Annulation" },
  { value: "rectificatif", label: "Rectificatif" },
];

const supportOptions: Array<{ value: TenderAvisSupport; label: string }> = [
  { value: "bomop", label: "BOMOP" },
  { value: "presse", label: "Presse" },
  { value: "plateforme", label: "Plateforme (BOMOP + Presse)" },
];

function toDateInputValue(dateValue: string) {
  if (!dateValue) {
    return "";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue.slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
}

export default function AvisEditorForm({
  locale,
  aoId,
  initialAvis,
}: AvisEditorFormProps) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isEditMode = Boolean(initialAvis);

  const [type, setType] = useState<TenderAvisType>(initialAvis?.type ?? "ao");
  const [title, setTitle] = useState(initialAvis?.title ?? "");
  const [support, setSupport] = useState<TenderAvisSupport>(
    initialAvis?.support ?? "plateforme",
  );
  const [publicationDate, setPublicationDate] = useState(
    toDateInputValue(initialAvis?.publicationDate ?? ""),
  );
  const [publicationEndDate, setPublicationEndDate] = useState(
    toDateInputValue(initialAvis?.publicationEndDate ?? ""),
  );
  const [contentHtml, setContentHtml] = useState(initialAvis?.content ?? "");
  const [fieldErrors, setFieldErrors] = useState<AvisFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backHref = useMemo(
    () => `/${locale}/dashboard/contractant/appels-offres/${aoId}?tab=avis`,
    [aoId, locale],
  );

  useEffect(() => {
    if (editorRef.current && initialAvis?.content) {
      editorRef.current.innerHTML = initialAvis.content;
    }
  }, [initialAvis?.content]);

  const fieldClass = (error?: string) =>
    cn(
      "h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-[#4CAF50]",
      error ? "border-red-300 bg-red-50" : "border-slate-200 bg-white",
    );

  const execEditorCommand = (command: string) => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();
    document.execCommand(command, false);
    setContentHtml(editorRef.current.innerHTML);
  };

  const validate = (): boolean => {
    const errors: AvisFormErrors = {};

    if (!type) {
      errors.type = "Le type d'avis est obligatoire.";
    }

    if (!title.trim()) {
      errors.title = "Le titre est obligatoire.";
    }

    if (!support) {
      errors.support = "Le support de publication est obligatoire.";
    }

    if (!publicationDate) {
      errors.publicationDate = "La date de publication est obligatoire.";
    }

    if (!publicationEndDate) {
      errors.publicationEndDate =
        "La date de fin de publication est obligatoire.";
    }

    if (
      publicationDate &&
      publicationEndDate &&
      publicationEndDate < publicationDate
    ) {
      errors.publicationEndDate =
        "La date de fin doit etre superieure ou egale a la date de publication.";
    }

    const editorText = editorRef.current?.textContent?.trim() || "";
    if (!editorText) {
      errors.content = "Le contenu est obligatoire.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (intent: SubmitIntent) => {
    if (!validate()) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    const payload: SaveTenderAvisPayload = {
      type,
      title: title.trim(),
      content: contentHtml,
      support,
      publicationDate,
      publicationEndDate,
    };

    try {
      if (isEditMode && initialAvis) {
        await updateServiceContractantTenderAvis(
          aoId,
          initialAvis.id,
          payload,
          intent === "publish",
        );
      } else if (intent === "publish") {
        await publishServiceContractantTenderAvis(aoId, payload);
      } else {
        await saveServiceContractantTenderAvisDraft(aoId, payload);
      }

      router.push(backHref);
      router.refresh();
    } catch (error) {
      setSubmitError(
        getTenderAvisErrorMessage(
          error,
          "Impossible d'enregistrer cet avis pour le moment.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-2xl font-bold text-slate-900">
          {isEditMode ? "Modifier l'avis" : "Informations de l'avis"}
        </h2>
        <p className="text-xs text-slate-500">
          AO #{aoId} - Renseignez les details de publication.
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
            Type d'avis
          </label>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as TenderAvisType)}
            className={fieldClass(fieldErrors.type)}
          >
            <option value="">Selectionner un type</option>
            {avisTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.type && (
            <p className="mt-1 text-[11px] text-red-600">{fieldErrors.type}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            Support de publication
          </label>
          <select
            value={support}
            onChange={(event) =>
              setSupport(event.target.value as TenderAvisSupport)
            }
            className={fieldClass(fieldErrors.support)}
          >
            <option value="">Selectionner un support</option>
            {supportOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.support && (
            <p className="mt-1 text-[11px] text-red-600">
              {fieldErrors.support}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">
            Titre
          </label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={180}
            placeholder="Ex. Avis d'attribution provisoire"
            className={fieldClass(fieldErrors.title)}
          />
          {fieldErrors.title && (
            <p className="mt-1 text-[11px] text-red-600">{fieldErrors.title}</p>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="mb-3 text-xs font-semibold text-slate-700">
          Echeances de publication
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] text-slate-600">
              Date publication
            </label>
            <input
              type="date"
              value={publicationDate}
              onChange={(event) => setPublicationDate(event.target.value)}
              className={fieldClass(fieldErrors.publicationDate)}
            />
            {fieldErrors.publicationDate && (
              <p className="mt-1 text-[11px] text-red-600">
                {fieldErrors.publicationDate}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-[11px] text-slate-600">
              Date fin publication
            </label>
            <input
              type="date"
              value={publicationEndDate}
              onChange={(event) => setPublicationEndDate(event.target.value)}
              className={fieldClass(fieldErrors.publicationEndDate)}
            />
            {fieldErrors.publicationEndDate && (
              <p className="mt-1 text-[11px] text-red-600">
                {fieldErrors.publicationEndDate}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 p-2">
          <p className="me-2 text-[11px] font-semibold text-slate-600">
            Contenu (rich text)
          </p>
          <button
            type="button"
            onClick={() => execEditorCommand("bold")}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Texte gras"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execEditorCommand("italic")}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Texte italique"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execEditorCommand("underline")}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Texte souligne"
          >
            <Underline className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execEditorCommand("insertUnorderedList")}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Liste a puces"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execEditorCommand("insertOrderedList")}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Liste numerotee"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
        </div>

        <div
          ref={editorRef}
          contentEditable
          onInput={(event) => {
            setContentHtml(event.currentTarget.innerHTML);
          }}
          className={cn(
            "min-h-52 p-3 text-sm text-slate-700 focus:outline-none",
            "[&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
          )}
          aria-label="Contenu rich text de l'avis"
        />
      </div>
      {fieldErrors.content && (
        <p className="mt-1 text-[11px] text-red-600">{fieldErrors.content}</p>
      )}

      <div className="mt-4 flex flex-col-reverse gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={backHref}
            className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Retour
          </Link>
          {/* {!isEditMode && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  void submit("draft");
                }}
                className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Enregistrer brouillon
              </button>
          )} */}
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => {
            void submit("publish");
          }}
          className="inline-flex h-9 items-center justify-center rounded-md bg-[#4CAF50] px-3 text-xs font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isEditMode ? "Enregistrer et publier" : "Publier"}
        </button>
      </div>
    </section>
  );
}
