"use client";

interface Props {
  isAr: boolean;
  humanDecision: "valide" | "invalide" | null;
  aiVerdict: "conforme" | "non_conforme" | null | undefined;
}

export default function HumanVsAiDivergenceFeedback({ isAr, humanDecision, aiVerdict }: Props) {
  if (!humanDecision || !aiVerdict) return null;

  const humanIsInvalid = humanDecision === "invalide";
  const aiIsConforme = aiVerdict === "conforme";

  // Only show after human makes a choice
  const diverges = (humanIsInvalid && aiIsConforme) || (!humanIsInvalid && !aiIsConforme);

  const aiLabel = aiVerdict === "conforme"
    ? (isAr ? "مطابق" : "Conforme")
    : (isAr ? "غير مطابق" : "Non conforme");

  return (
    <div style={{ marginTop: 10, direction: isAr ? "rtl" : "ltr" }}>
      {/* Always show what the AI said */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280" }}>
        <span>✨</span>
        <span>
          {isAr ? "صنّف الذكاء الاصطناعي هذه الوثيقة على أنها :" : "L'IA avait classé ce document comme :"}
          {" "}
          <span style={{ fontWeight: 700, color: aiVerdict === "conforme" ? "#2e7d32" : "#dc2626" }}>
            {aiLabel}
          </span>
        </span>
      </div>

      {/* Divergence banner — only when human and AI disagree */}
      {diverges && (
        <div style={{
          marginTop: 8,
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          padding: "10px 12px",
          borderRadius: 10,
          background: "rgba(234,179,8,0.07)",
          border: "1px solid rgba(234,179,8,0.3)",
          fontSize: 12,
          color: "#92400e",
          lineHeight: 1.5,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span>
            {isAr
              ? "قرارك يختلف عن تحليل الذكاء الاصطناعي. سيتم إنشاء تقرير التباين تلقائيًا."
              : "Votre décision diverge de l'analyse IA. Un rapport de divergence sera généré."}
          </span>
        </div>
      )}
    </div>
  );
}
