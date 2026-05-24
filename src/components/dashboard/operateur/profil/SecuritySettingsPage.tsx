"use client";

import { useState, useEffect } from "react";
import {
  Smartphone, Monitor, Lock, Trash2, LogOut,
  CheckCircle2, XCircle, Eye, EyeOff, AlertTriangle, Key,
} from "lucide-react";
import { MOCK_SESSIONS, type Session } from "./types";
import { apiClient } from "@/services/client";

// ─── MFA Section ──────────────────────────────────────────────────────────────

function MfaSection() {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [showQr, setShowQr]         = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [password, setPassword]     = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [pwError, setPwError]       = useState("");

  async function handleDisable() {
    if (!password.trim()) { setPwError("Le mot de passe est requis."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setMfaEnabled(false);
    setShowDisable(false);
    setPassword("");
    setPwError("");
    setLoading(false);
  }

  async function handleEnable() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setShowQr(true);
    setLoading(false);
  }

  async function handleConfirmSetup() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setMfaEnabled(true);
    setShowQr(false);
    setLoading(false);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-3.5">
        <Smartphone className="h-4 w-4 text-slate-400" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600">
          Authentification à deux facteurs (MFA)
        </h2>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-700">
              {mfaEnabled
                ? "Le MFA est activé sur votre compte. Votre compte est protégé."
                : "Le MFA est désactivé. Activez-le pour renforcer la sécurité de votre compte."}
            </p>
            <div className="mt-2">
              {mfaEnabled ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Activé
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
                  <XCircle className="h-3 w-3" /> Désactivé
                </span>
              )}
            </div>
          </div>
          {mfaEnabled ? (
            <button type="button" onClick={() => setShowDisable(true)}
              className="shrink-0 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
              Désactiver
            </button>
          ) : (
            <button type="button" onClick={handleEnable} disabled={loading}
              className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#4CAF50" }}>
              {loading ? "Chargement…" : "Activer le MFA"}
            </button>
          )}
        </div>

        {/* QR Setup flow */}
        {showQr && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="mb-3 text-xs font-semibold text-emerald-800">
              Scannez ce QR code avec votre application d&apos;authentification (Google Authenticator, Authy…)
            </p>
            {/* Placeholder QR */}
            <div className="mb-4 flex h-36 w-36 items-center justify-center rounded-lg border-2 border-dashed border-emerald-300 bg-white">
              <div className="grid grid-cols-5 gap-px opacity-40">
                {[...Array(25)].map((_, i) => (
                  <div key={i} className={`h-5 w-5 rounded-sm ${Math.random() > 0.5 ? "bg-slate-800" : "bg-white"}`} />
                ))}
              </div>
            </div>
            <p className="mb-3 text-[11px] text-emerald-700">
              Clé manuelle : <span className="font-mono font-bold">JBSWY3DPEHPK3PXP</span>
            </p>
            <button type="button" onClick={handleConfirmSetup} disabled={loading}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#4CAF50" }}>
              {loading ? "Vérification…" : "J'ai configuré l'application →"}
            </button>
          </div>
        )}

        {/* Disable confirm */}
        {showDisable && (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <p className="text-xs font-semibold text-rose-800">
                Confirmez votre mot de passe pour désactiver le MFA
              </p>
            </div>
            <div className="relative mb-3">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPwError(""); }}
                placeholder="Mot de passe actuel"
                className={`h-9 w-full rounded-lg border bg-white px-3 pr-9 text-xs text-slate-800 outline-none transition-colors ${pwError ? "border-rose-400" : "border-slate-200 focus:border-rose-400"}`}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {pwError && <p className="mb-2 text-[11px] text-rose-600">{pwError}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={handleDisable} disabled={loading}
                className="rounded-lg border border-rose-300 bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors">
                {loading ? "Désactivation…" : "Confirmer la désactivation"}
              </button>
              <button type="button" onClick={() => { setShowDisable(false); setPassword(""); setPwError(""); }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Sessions Section ─────────────────────────────────────────────────────────

function SessionsSection() {
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);

  // Fetch real sessions from API
  useEffect(() => {
    apiClient<{ sessions?: { id: string; deviceInfo?: string; ipAddress?: string; createdAt?: string }[] }>(
      "/api/v1/auth/sessions",
      { method: "GET" },
    )
      .then((data) => {
        if (data?.sessions && data.sessions.length > 0) {
          setSessions(
            data.sessions.map((s, i) => ({
              id: s.id,
              device: s.deviceInfo || "Unknown device",
              ip: s.ipAddress || "0.0.0.0",
              lastActive: s.createdAt || new Date().toISOString(),
              current: i === 0,
            })),
          );
        }
      })
      .catch(() => { /* keep mock fallback */ });
  }, []);

  function revokeSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  function revokeAll() {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-DZ", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  const others = sessions.filter((s) => !s.isCurrent);

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Monitor className="h-4 w-4 text-slate-400" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600">Sessions actives</h2>
        </div>
        {others.length > 0 && (
          <button type="button" onClick={revokeAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
            <LogOut className="h-3 w-3" /> Révoquer toutes les autres
          </button>
        )}
      </div>
      <ul className="divide-y divide-slate-100 p-2">
        {sessions.map((s) => (
          <li key={s.id} className={`flex items-start gap-3 rounded-lg px-3 py-3 ${s.isCurrent ? "bg-emerald-50/60" : "hover:bg-slate-50"} transition-colors`}>
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.isCurrent ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
              <Monitor className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-slate-800 truncate">{s.userAgent}</p>
                {s.isCurrent && (
                  <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-px text-[9px] font-bold text-emerald-700">
                    Session actuelle
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                IP : <span className="font-mono">{s.ip}</span>
              </p>
              <p className="text-[11px] text-slate-400">{fmtDate(s.createdAt)}</p>
            </div>
            {!s.isCurrent && (
              <button type="button" onClick={() => revokeSession(s.id)}
                title="Révoquer cette session"
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Password Section ─────────────────────────────────────────────────────────

function PasswordSection() {
  const [form, setForm]       = useState({ current: "", next: "", confirm: "" });
  const [show, setShow]       = useState({ current: false, next: false, confirm: false });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.current) e.current = "Requis";
    if (form.next.length < 8) e.next = "Minimum 8 caractères";
    if (form.next !== form.confirm) e.confirm = "Les mots de passe ne correspondent pas";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      await apiClient<{ message: string }>("/api/v1/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: form.current,
          newPassword: form.next,
          confirmeNewPassword: form.confirm,
        }),
      });
      setSuccess(true);
      setForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors du changement de mot de passe";
      setErrors({ current: message });
    } finally {
      setSaving(false);
    }
  }

  function PasswordField({ id, label, value, showVal, onToggle, onChange, error }: {
    id: string; label: string; value: string; showVal: boolean;
    onToggle: () => void; onChange: (v: string) => void; error?: string;
  }) {
    return (
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</label>
        <div className="relative">
          <input
            type={showVal ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="••••••••"
            className={`h-9 w-full rounded-lg border bg-slate-50 px-3 pr-9 text-xs text-slate-800 outline-none transition-colors placeholder:text-slate-300 ${error ? "border-rose-400 focus:border-rose-400" : "border-slate-200 focus:border-[#4CAF50] focus:bg-white"}`}
          />
          <button type="button" onClick={onToggle}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showVal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
        {error && <p className="mt-1 text-[11px] text-rose-500">{error}</p>}
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-3.5">
        <Key className="h-4 w-4 text-slate-400" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600">Changer le mot de passe</h2>
      </div>
      <div className="p-5">
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-xs font-semibold text-emerald-700">Mot de passe mis à jour avec succès.</p>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <PasswordField id="current" label="Mot de passe actuel"
              value={form.current} showVal={show.current}
              onToggle={() => setShow({ ...show, current: !show.current })}
              onChange={(v) => setForm({ ...form, current: v })}
              error={errors.current} />
          </div>
          <PasswordField id="next" label="Nouveau mot de passe"
            value={form.next} showVal={show.next}
            onToggle={() => setShow({ ...show, next: !show.next })}
            onChange={(v) => setForm({ ...form, next: v })}
            error={errors.next} />
          <PasswordField id="confirm" label="Confirmer le mot de passe"
            value={form.confirm} showVal={show.confirm}
            onToggle={() => setShow({ ...show, confirm: !show.confirm })}
            onChange={(v) => setForm({ ...form, confirm: v })}
            error={errors.confirm} />
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={handleSubmit} disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#4CAF50" }}>
            <Lock className="h-3.5 w-3.5" />
            {saving ? "Mise à jour…" : "Mettre à jour le mot de passe"}
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function SecuritySettingsPage({ dict, locale }: { dict?: any; locale?: string }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Sécurité</h1>
        <p className="mt-0.5 text-sm text-slate-500">Gérez la sécurité de votre compte</p>
      </div>

      <MfaSection />
      <SessionsSection />
      <PasswordSection />
    </div>
  );
}