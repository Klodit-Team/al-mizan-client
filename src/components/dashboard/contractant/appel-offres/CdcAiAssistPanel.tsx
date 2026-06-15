"use client";
import { useState } from "react";

interface Props {
  isAr: boolean;
  onInsert: (text: string) => void;
}

const SECTION_TYPES_FR = [
  "Critères techniques",
  "Conditions de participation",
  "Délais d'exécution",
  "Cahier des clauses administratives",
  "Spécifications techniques détaillées",
  "Modalités de paiement",
];

const SECTION_TYPES_AR = [
  "المعايير التقنية",
  "شروط المشاركة",
  "آجال التنفيذ",
  "دفتر الشروط الإدارية",
  "المواصفات التقنية التفصيلية",
  "طرق الدفع",
];

export default function CdcAiAssistPanel({ isAr, onInsert }: Props) {
  const [open, setOpen] = useState(false);
  const [sectionType, setSectionType] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [hasBias, setHasBias] = useState(false);

  const sectionTypes = isAr ? SECTION_TYPES_AR : SECTION_TYPES_FR;

  const handleGenerate = async () => {
    if (!sectionType) return;
    setIsGenerating(true);
    setDraft(null);
    setHasBias(false);
    try {
      // Calls the CDC agent via the API gateway — event: cdc.draft.requested
      const res = await fetch("/api/v1/cdc/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionType, userPrompt: prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setDraft(data.draft ?? "");
        setHasBias(Boolean(data.biasDetected));
      }
    } catch {
      setDraft(isAr ? "حدث خطأ أثناء التوليد." : "Une erreur est survenue lors de la génération.");
    } finally {
      setIsGenerating(false);
    }
  };

  const dir = isAr ? "rtl" : "ltr";

  return (
    <div style={{ border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden", direction: dir }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", background: open ? "#F8FAFC" : "#fff", border: "none", cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>✨</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1B1C1C" }}>
            {isAr ? "مساعدة الذكاء الاصطناعي — صياغة دفتر الشروط" : "Assistance IA — Rédaction CDC"}
          </span>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(76,175,80,0.1)", color: "#2e7d32", fontWeight: 600 }}>
            {isAr ? "اختياري" : "Optionnel"}
          </span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <path d="M6 9l6 6 6-6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div style={{ padding: "16px 18px", borderTop: "1px solid #F3F4F6", background: "#fff", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Section selector */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#364150", display: "block", marginBottom: 6 }}>
              {isAr ? "نوع الفصل" : "Type de section"}
            </label>
            <select
              value={sectionType}
              onChange={(e) => setSectionType(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 13, color: "#364150", background: "#fff", outline: "none" }}
            >
              <option value="">{isAr ? "اختر نوع الفصل…" : "Sélectionner le type de section…"}</option>
              {sectionTypes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Context prompt */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#364150", display: "block", marginBottom: 6 }}>
              {isAr ? "السياق أو التعليمات (اختياري)" : "Contexte ou instructions (optionnel)"}
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isAr ? "صِف السياق أو أضف تعليمات للذكاء الاصطناعي…" : "Décrivez le contexte ou ajoutez des instructions pour l'IA…"}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 13, color: "#364150", resize: "none", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !sectionType}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: (isGenerating || !sectionType) ? "#E5E7EB" : "#4CAF50", color: (isGenerating || !sectionType) ? "#9CA3AF" : "#fff", border: "none", cursor: (isGenerating || !sectionType) ? "not-allowed" : "pointer" }}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {isAr ? "جارٍ التوليد…" : "Génération en cours…"}
              </>
            ) : (
              <>{isAr ? "توليد المسودة" : "Générer le brouillon"}</>
            )}
          </button>

          {/* Bias warning */}
          {hasBias && draft && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 10, background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.3)", fontSize: 12, color: "#92400e" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>
              {isAr
                ? "اكتشف الذكاء الاصطناعي بنودًا تمييزية محتملة — تم توليد نسخة معدّلة تلقائيًا."
                : "L'IA a détecté des clauses potentiellement discriminatoires — une version corrigée a été générée automatiquement."}
            </div>
          )}

          {/* Draft result */}
          {draft !== null && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#364150", display: "block", marginBottom: 6 }}>
                {isAr ? "المسودة المقترحة" : "Brouillon généré"}
              </label>
              <textarea
                rows={6}
                readOnly
                value={draft}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 12, color: "#364150", background: "#F8FAFC", resize: "none", outline: "none", boxSizing: "border-box" }}
              />
              <button
                onClick={() => { if (draft) onInsert(draft); }}
                style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#1E293B", color: "#fff", border: "none", cursor: "pointer" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                {isAr ? "إدراج في دفتر الشروط" : "Insérer dans le CDC"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
