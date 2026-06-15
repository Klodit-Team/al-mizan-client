"use client";

export interface GreAGreAiVerdict {
  scoreConformite: number;
  recommandation: "ACCEPTER" | "REJETER" | string;
  justificationIa: string;
  confianceScore: number;
  modeleIa: string;
  dateAnalyse: string;
}

interface Props {
  isAr: boolean;
  verdict: GreAGreAiVerdict | null | undefined;
  isLoading?: boolean;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const filled = (score / 100) * circ;
  const color = score >= 70 ? "#4CAF50" : score >= 40 ? "#EAB308" : "#EF4444";

  return (
    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
      <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={radius} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
        />
      </svg>
      <span style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, fontWeight: 800, color,
      }}>
        {score}
      </span>
    </div>
  );
}

export default function GreAGreAiVerdictPanel({ isAr, verdict, isLoading = false }: Props) {
  const dir = isAr ? "rtl" : "ltr";

  const containerStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: "20px 22px",
    direction: dir,
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div className="animate-pulse" style={{ width: 72, height: 72, borderRadius: "50%", background: "#F1F5F9" }} />
          <div style={{ flex: 1 }}>
            <div className="animate-pulse" style={{ height: 16, width: "60%", background: "#F1F5F9", borderRadius: 6, marginBottom: 8 }} />
            <div className="animate-pulse" style={{ height: 12, width: "80%", background: "#F1F5F9", borderRadius: 6 }} />
          </div>
        </div>
        <div className="animate-pulse" style={{ height: 12, background: "#F1F5F9", borderRadius: 6, marginBottom: 6 }} />
        <div className="animate-pulse" style={{ height: 12, width: "70%", background: "#F1F5F9", borderRadius: 6 }} />
      </div>
    );
  }

  if (!verdict) {
    return (
      <div style={{ ...containerStyle, textAlign: "center", padding: "28px 22px" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 12px", opacity: 0.4 }}>
          <circle cx="12" cy="12" r="9" stroke="#94A3B8" strokeWidth="2" />
          <path d="M12 7v5l3 3" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", margin: "0 0 4px" }}>
          {isAr ? "تحليل جارٍ…" : "Analyse en cours…"}
        </p>
        <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
          {isAr ? "جارٍ تحليل ملف الطلب بواسطة الذكاء الاصطناعي" : "L'agent IA est en train d'analyser le dossier"}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-bounce" style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50", animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  const isAccepted = verdict.recommandation === "ACCEPTER";
  const isRejected = verdict.recommandation === "REJETER";
  const recColor = isAccepted ? "#2e7d32" : isRejected ? "#dc2626" : "#92400e";
  const recBg   = isAccepted ? "rgba(76,175,80,0.1)" : isRejected ? "rgba(239,68,68,0.08)" : "rgba(234,179,8,0.1)";
  const recLabel = isAccepted
    ? (isAr ? "مقبول ✓" : "Conforme ✓")
    : isRejected
    ? (isAr ? "مرفوض ✗" : "Non conforme ✗")
    : (isAr ? "مراجعة مطلوبة ⚠" : "Révision requise ⚠");

  return (
    <div style={containerStyle}>
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 16 }}>✨</span>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1B1C1C", margin: 0 }}>
          {isAr ? "تحليل الذكاء الاصطناعي" : "Analyse IA"}
        </h3>
      </div>

      {/* Score + recommendation */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <ScoreRing score={verdict.scoreConformite} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 6px" }}>
            {isAr ? "نتيجة الامتثال" : "Score de conformité"}
          </p>
          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 999, background: recBg, color: recColor }}>
            {recLabel}
          </span>
        </div>
      </div>

      {/* Justification */}
      <div style={{ background: "#F8FAFC", border: "1px solid #F0EDED", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9CA3AF", margin: "0 0 8px" }}>
          {isAr ? "مبرر الذكاء الاصطناعي" : "Justification IA"}
        </p>
        <p style={{ fontSize: 12, color: "#364150", lineHeight: 1.6, margin: 0 }}>
          {verdict.justificationIa}
        </p>
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, color: "#9CA3AF" }}>
        <span>
          {isAr ? "الثقة:" : "Confiance :"}{" "}
          <span style={{ fontWeight: 600, color: "#4CAF50" }}>{Math.round(verdict.confianceScore)}%</span>
        </span>
        <span>·</span>
        <span style={{ fontStyle: "italic" }}>{verdict.modeleIa}</span>
        {verdict.dateAnalyse && (
          <>
            <span>·</span>
            <span>{new Date(verdict.dateAnalyse).toLocaleDateString(isAr ? "ar-DZ" : "fr-DZ")}</span>
          </>
        )}
      </div>
    </div>
  );
}
