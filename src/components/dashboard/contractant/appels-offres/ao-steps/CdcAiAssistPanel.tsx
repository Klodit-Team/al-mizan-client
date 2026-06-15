"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Clock,
  FileText,
  FilePen,
  Loader2,
  RefreshCw,
  Settings2,
  Shield,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/services/client";

const SECTION_TYPES = [
  { value: "criteres_techniques",      label: "Critères techniques",        Icon: Settings2 },
  { value: "conditions_participation", label: "Conditions de participation", Icon: Users      },
  { value: "delais",                   label: "Délais & modalités",          Icon: Clock      },
  { value: "specifications",           label: "Spécifications",              Icon: FileText   },
  { value: "evaluation",               label: "Critères d'évaluation",       Icon: Star       },
] as const;

type SectionType = (typeof SECTION_TYPES)[number]["value"];

const QUICK_PROMPTS: Record<SectionType, string[]> = {
  criteres_techniques: [
    "Fourniture de matériel informatique haute disponibilité",
    "Construction d'infrastructure réseau fibre optique",
    "Acquisition de logiciels de gestion ERP",
  ],
  conditions_participation: [
    "PME algérienne avec 3 ans d'expérience minimum",
    "Entreprise certifiée ISO 9001 dans le domaine concerné",
    "Groupement d'entreprises avec mandataire désigné",
  ],
  delais: [
    "Délai d'exécution 6 mois, retrait DCE 15 jours",
    "Projet en 3 phases sur 12 mois avec jalons intermédiaires",
    "Livraison urgente sous 30 jours ouvrables",
  ],
  specifications: [
    "Fournitures de bureau conformes aux normes algériennes",
    "Équipements médicaux homologués et certifiés CE",
    "Réhabilitation d'un bâtiment administratif",
  ],
  evaluation: [
    "Critères techniques 60 % / financiers 40 %",
    "Offre la moins disante sur critères techniques équivalents",
    "Évaluation par points : qualité 50, prix 30, délai 20",
  ],
};

interface CdcDraftResponse {
  draft: string;
  biasDetected: boolean;
  correctedDraft?: string;
}

async function generateCdcDraft(
  aoId: string | undefined,
  sectionType: SectionType,
  prompt: string,
): Promise<CdcDraftResponse> {
  return apiClient<CdcDraftResponse>("/api/v1/ao/cdc-draft", {
    method: "POST",
    body: JSON.stringify({ aoId, sectionType, userPrompt: prompt }),
  });
}

interface CdcAiAssistPanelProps {
  aoId?: string;
  onInsert: (text: string) => void;
  dict: { aiTitle: string; aiDescription: string; aiButton: string };
}

export default function CdcAiAssistPanel({ aoId, onInsert, dict }: CdcAiAssistPanelProps) {
  const [open, setOpen] = useState(false);
  const [sectionType, setSectionType] = useState<SectionType>("criteres_techniques");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftText, setDraftText] = useState<string | null>(null);
  const [originalDraftText, setOriginalDraftText] = useState<string | null>(null);
  const [correctedDraftText, setCorrectedDraftText] = useState<string | null>(null);
  const [hasBias, setHasBias] = useState(false);
  const [showingCorrected, setShowingCorrected] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canGenerate = !!aoId && !!prompt.trim() && !isGenerating;

  const resetDraft = () => {
    setDraftText(null);
    setOriginalDraftText(null);
    setCorrectedDraftText(null);
    setHasBias(false);
    setShowingCorrected(true);
    setError(null);
  };

  const runGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setDraftText(null);
    setOriginalDraftText(null);
    setCorrectedDraftText(null);
    setHasBias(false);
    setShowingCorrected(true);

    try {
      const result = await generateCdcDraft(aoId, sectionType, prompt);
      setHasBias(result.biasDetected);
      setOriginalDraftText(result.draft);
      setCorrectedDraftText(result.correctedDraft ?? null);
      setDraftText(
        result.biasDetected && result.correctedDraft
          ? result.correctedDraft
          : result.draft,
      );
    } catch {
      setError("La génération a échoué. Vérifiez votre connexion ou réessayez plus tard.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!draftText) return;
    await navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleVersion = () => {
    if (!hasBias || !originalDraftText || !correctedDraftText) return;
    const next = !showingCorrected;
    setShowingCorrected(next);
    setDraftText(next ? correctedDraftText : originalDraftText);
  };

  return (
    <div className={cn(
      "rounded-xl border transition-colors duration-150",
      open ? "border-[#4CAF50]/40 bg-[#F4FBF4]" : "border-[#D8EFD9] bg-[#EFF9EF]",
    )}>
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className={cn(
          "shrink-0 rounded-lg p-1.5 transition-colors",
          open ? "bg-[#4CAF50] text-white" : "bg-white/80 text-[#2F9E44]",
        )}>
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">{dict.aiTitle}</p>
          <p className="mt-0.5 text-xs text-slate-500">{dict.aiDescription}</p>
        </div>
        <div className="shrink-0 text-slate-400">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-[#D8EFD9] px-4 pb-4 pt-3 space-y-4">

          {/* Section type pills */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Type de section
            </p>
            <div className="flex flex-wrap gap-2">
              {SECTION_TYPES.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setSectionType(value); resetDraft(); }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-all",
                    sectionType === value
                      ? "border-[#4CAF50] bg-[#4CAF50] text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#4CAF50]/50 hover:text-[#2F9E44]",
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt input */}
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Contexte & instructions
            </p>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Décrivez le marché, les exigences spécifiques ou ajoutez des contraintes particulières…"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50]/20 resize-none transition-colors"
              />
              {prompt && (
                <button
                  type="button"
                  onClick={() => { setPrompt(""); resetDraft(); }}
                  className="absolute right-2 top-2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="mt-1 text-right text-[10px] text-slate-400">{prompt.length} car.</p>

            {/* Quick-prompt suggestions */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS[sectionType].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setPrompt(suggestion)}
                  className="rounded-md border border-dashed border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-500 hover:border-[#4CAF50]/50 hover:text-[#2F9E44] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button + hint */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!canGenerate}
              onClick={runGenerate}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-semibold transition-all",
                canGenerate
                  ? "bg-[#4CAF50] text-white hover:bg-[#43A047] shadow-sm"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed",
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Génération en cours…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  {draftText ? "Régénérer" : "Générer le brouillon"}
                </>
              )}
            </button>
            {!aoId && (
              <p className="text-[10px] text-amber-600">
                Enregistrez d'abord le brouillon pour activer cette fonctionnalité.
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Bias warning */}
          {hasBias && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
              <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-600" />
              <div className="flex-1 text-[11px] text-amber-800">
                <span className="font-semibold">Clause potentiellement discriminatoire détectée.</span>
                {" "}Une version corrigée a été générée automatiquement.
                {originalDraftText && correctedDraftText && (
                  <button
                    type="button"
                    onClick={handleToggleVersion}
                    className="ml-2 font-medium underline underline-offset-2 hover:text-amber-900 transition-colors"
                  >
                    {showingCorrected ? "Voir le texte original" : "Voir la version corrigée"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Preview card */}
          {draftText && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                  <FilePen className="h-3.5 w-3.5" />
                  Aperçu du brouillon
                  {hasBias && (
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                      showingCorrected
                        ? "bg-[#4CAF50]/15 text-[#2F9E44]"
                        : "bg-amber-100 text-amber-700",
                    )}>
                      {showingCorrected ? "corrigé" : "original"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={runGenerate}
                    disabled={!canGenerate}
                    title="Régénérer"
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    title={copied ? "Copié !" : "Copier le texte"}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    {copied
                      ? <Check className="h-3.5 w-3.5 text-[#4CAF50]" />
                      : <ClipboardCopy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Text preview */}
              <pre className="max-h-52 overflow-y-auto whitespace-pre-wrap px-3 py-3 text-[11px] leading-relaxed text-slate-700 font-sans">
                {draftText}
              </pre>

              {/* Card footer */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-[10px] text-slate-400">
                  {draftText.length} car. · {draftText.split("\n").filter(Boolean).length} lignes
                </span>
                <button
                  type="button"
                  onClick={() => onInsert(draftText)}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md bg-[#4CAF50] px-3 text-[11px] font-semibold text-white hover:bg-[#43A047] transition-colors shadow-sm"
                >
                  <Check className="h-3 w-3" />
                  {dict.aiButton}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
