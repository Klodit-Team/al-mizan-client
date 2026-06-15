"use client";

import { useState, useEffect } from "react";
import {
  User, Building2, Briefcase, Pencil, CheckCircle2, XCircle,
  BadgeCheck, AlertTriangle, ChevronDown, Save, X,
} from "lucide-react";
import {
  MOCK_PERSONAL, MOCK_ORGANISATION, MOCK_OE_PROFILE, WILAYAS,
  type PersonalInfo, type OrganisationInfo, type OeProfileInfo,
} from "./types";
import { apiClient } from "@/services/client";
import { getProfileByUserId, updateProfileByUserId } from "@/services/admin/users";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function SectionCard({ title, icon, children, onEdit, editing, onSave, onCancel, saving }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onEdit?: () => void;
  editing?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  saving?: boolean;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-slate-400">{icon}</span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600">{title}</h2>
        </div>
        {onEdit && !editing && (
          <button type="button" onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Pencil className="h-3 w-3" /> Modifier
          </button>
        )}
        {editing && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={onCancel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <X className="h-3 w-3" /> Annuler
            </button>
            <button type="button" onClick={onSave} disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#4CAF50" }}>
              <Save className="h-3 w-3" />
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 border-b border-slate-100 py-2.5 last:border-0 sm:grid-cols-[180px_1fr]">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="text-xs text-slate-700">{value}</dd>
    </div>
  );
}

function FieldInput({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 outline-none focus:border-[#4CAF50] focus:bg-white transition-colors"
      />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 pr-8 text-xs text-slate-800 outline-none focus:border-[#4CAF50] focus:bg-white transition-colors"
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

function StatusBadge({ ok, labelOk, labelKo }: { ok: boolean; labelOk: string; labelKo: string }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
      <CheckCircle2 className="h-3 w-3" /> {labelOk}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
      <XCircle className="h-3 w-3" /> {labelKo}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ prenom, nom }: { prenom: string; nom: string }) {
  const initials = `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-black text-white"
        style={{ backgroundColor: "#4CAF50" }}>
        {initials}
      </div>
      <div>
        <p className="text-base font-bold text-slate-900">{prenom} {nom}</p>
        <p className="text-xs text-slate-500">Opérateur Économique</p>
        <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-px text-[10px] font-semibold text-emerald-700">
          <BadgeCheck className="h-3 w-3" /> Compte vérifié
        </span>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function MyProfilePage({ dict }: { dict?: any }) {
  // Personal
  const [personal, setPersonal]     = useState<PersonalInfo>(MOCK_PERSONAL);
  const [pDraft, setPDraft]         = useState<PersonalInfo>(MOCK_PERSONAL);
  const [editingP, setEditingP]     = useState(false);
  const [savingP, setSavingP]       = useState(false);

  // Organisation
  const [org, setOrg]               = useState<OrganisationInfo>(MOCK_ORGANISATION);
  const [oDraft, setODraft]         = useState<OrganisationInfo>(MOCK_ORGANISATION);
  const [editingO, setEditingO]     = useState(false);
  const [savingO, setSavingO]       = useState(false);

  // Fetch real profile from API
  useEffect(() => {
    (async () => {
      try {
        const me = await apiClient<{ user?: { userId?: string; email?: string } }>("/api/v1/auth/me", { method: "GET" });
        const userId = me?.user?.userId;
        if (!userId) return;

        const profile = await getProfileByUserId(userId).catch(() => null);
        if (profile) {
          const p: PersonalInfo = {
            nom: profile.nom ?? "",
            prenom: profile.prenom ?? "",
            telephone: profile.telephone ?? "",
            email: me.user?.email ?? "",
            langue: profile.langue ?? "fr",
          };
          setPersonal(p);
          setPDraft(p);
        }

        // Fetch operateur + organisation data
        const oeListRaw = await apiClient<unknown>("/api/v1/users/operateurs-economiques?page=1&limit=100", { method: "GET" }).catch(() => null);
        if (oeListRaw) {
          const list = Array.isArray(oeListRaw) ? oeListRaw : (oeListRaw as { data?: unknown[] })?.data || [];
          const normalizedUserId = userId.trim().toLowerCase();
          const current = (list as { id?: string; userId?: string; user_id?: string; organisationId?: string; qualifications?: string | string[]; categories?: string | string[]; isEligible?: boolean; isBlacklisted?: boolean; organisation?: { denomination?: string; nif?: string; nis?: string; registreCommerce?: string; adresse?: string; wilaya?: string; type?: string; isVerified?: boolean } }[]).find(
            (item) => (item.userId || item.user_id || "").trim().toLowerCase() === normalizedUserId,
          );
          if (current?.organisation) {
            const o: OrganisationInfo = {
              denomination: current.organisation.denomination || "",
              nif: current.organisation.nif || "",
              nis: current.organisation.nis || "",
              rc: current.organisation.registreCommerce || "",
              adresse: current.organisation.adresse || "",
              wilaya: current.organisation.wilaya || "",
              type: (current.organisation.type as OrganisationInfo["type"]) || "Autre",
              is_verified: current.organisation.isVerified ?? false,
            };
            setOrg(o);
            setODraft(o);
          }

          // OE-specific fields
          const oeData: OeProfileInfo = {
            qualifications: current.qualifications ? (Array.isArray(current.qualifications) ? current.qualifications : String(current.qualifications).split(",").map((s: string) => s.trim())) : [],
            categoriesProfessionnelles: current.categories ? (Array.isArray(current.categories) ? current.categories : String(current.categories).split(",").map((s: string) => s.trim())) : [],
            is_eligible: current.isEligible ?? true,
            is_blacklisted: current.isBlacklisted ?? false,
          };
          setOe(oeData);
        }
      } catch { /* keep mock fallback */ }
    })();
  }, []);

  // OE profile (read-only display)
  const [oe, setOe] = useState<OeProfileInfo>(MOCK_OE_PROFILE);

  async function savePersonal() {
    setSavingP(true);
    try {
      // Resolve the auth userId from the stored personal data or re-fetch
      const me = await apiClient<{ user?: { userId?: string } }>("/api/v1/auth/me", { method: "GET" });
      const userId = me?.user?.userId;
      if (userId) {
        await updateProfileByUserId(userId, {
          nom: pDraft.nom,
          prenom: pDraft.prenom,
          telephone: pDraft.telephone || undefined,
          langue: pDraft.langue,
        });
      }
      setPersonal(pDraft);
      setEditingP(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSavingP(false);
    }
  }

  async function saveOrg() {
    setSavingO(true);
    await new Promise((r) => setTimeout(r, 700));
    setOrg(oDraft);
    setEditingO(false);
    setSavingO(false);
  }

  return (
    <div className="space-y-4">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Mon Profil</h1>
        <p className="mt-0.5 text-sm text-slate-500">Gérez vos informations personnelles et professionnelles</p>
      </div>

      {/* Avatar card */}
      <Avatar prenom={personal.prenom} nom={personal.nom} />

      {/* ── Personal info ─────────────────────────────────────────────────── */}
      <SectionCard
        title="Informations personnelles"
        icon={<User className="h-4 w-4" />}
        onEdit={() => { setPDraft(personal); setEditingP(true); }}
        editing={editingP}
        onSave={savePersonal}
        onCancel={() => setEditingP(false)}
        saving={savingP}
      >
        {editingP ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldInput label="Prénom" value={pDraft.prenom} onChange={(v) => setPDraft({ ...pDraft, prenom: v })} />
            <FieldInput label="Nom" value={pDraft.nom} onChange={(v) => setPDraft({ ...pDraft, nom: v })} />
            <FieldInput label="Email" value={pDraft.email} onChange={(v) => setPDraft({ ...pDraft, email: v })} type="email" />
            <FieldInput label="Téléphone" value={pDraft.telephone} onChange={(v) => setPDraft({ ...pDraft, telephone: v })} type="tel" />
            <FieldSelect label="Langue préférée" value={pDraft.langue}
              onChange={(v) => setPDraft({ ...pDraft, langue: v as "fr" | "ar" })}
              options={["fr", "ar"]} />
          </div>
        ) : (
          <dl>
            <InfoRow label="Prénom" value={personal.prenom} />
            <InfoRow label="Nom" value={personal.nom} />
            <InfoRow label="Email" value={personal.email} />
            <InfoRow label="Téléphone" value={personal.telephone} />
            <InfoRow label="Langue préférée" value={personal.langue === "fr" ? "Français" : "العربية"} />
          </dl>
        )}
      </SectionCard>

      {/* ── Organisation info ──────────────────────────────────────────────── */}
      <SectionCard
        title="Informations de l'organisation"
        icon={<Building2 className="h-4 w-4" />}
        onEdit={() => { setODraft(org); setEditingO(true); }}
        editing={editingO}
        onSave={saveOrg}
        onCancel={() => setEditingO(false)}
        saving={savingO}
      >
        {editingO ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldInput label="Dénomination sociale" value={oDraft.denomination}
                onChange={(v) => setODraft({ ...oDraft, denomination: v })} />
            </div>
            <FieldInput label="NIF" value={oDraft.nif} onChange={(v) => setODraft({ ...oDraft, nif: v })} />
            <FieldInput label="NIS" value={oDraft.nis} onChange={(v) => setODraft({ ...oDraft, nis: v })} />
            <FieldInput label="Registre de Commerce" value={oDraft.rc} onChange={(v) => setODraft({ ...oDraft, rc: v })} />
            <FieldSelect label="Forme juridique" value={oDraft.type}
              onChange={(v) => setODraft({ ...oDraft, type: v as OrganisationInfo["type"] })}
              options={["SARL", "SPA", "EURL", "SNC", "Autre"]} />
            <div className="sm:col-span-2">
              <FieldInput label="Adresse" value={oDraft.adresse} onChange={(v) => setODraft({ ...oDraft, adresse: v })} />
            </div>
            <FieldSelect label="Wilaya" value={oDraft.wilaya}
              onChange={(v) => setODraft({ ...oDraft, wilaya: v })}
              options={WILAYAS} />
          </div>
        ) : (
          <dl>
            <InfoRow label="Dénomination" value={
              <span className="font-semibold text-slate-800">{org.denomination}</span>
            } />
            <InfoRow label="NIF" value={<span className="font-mono text-[11px]">{org.nif}</span>} />
            <InfoRow label="NIS" value={<span className="font-mono text-[11px]">{org.nis}</span>} />
            <InfoRow label="Registre de Commerce" value={<span className="font-mono text-[11px]">{org.rc}</span>} />
            <InfoRow label="Forme juridique" value={org.type} />
            <InfoRow label="Adresse" value={org.adresse} />
            <InfoRow label="Wilaya" value={org.wilaya} />
            <InfoRow label="Statut vérification" value={
              <StatusBadge ok={org.is_verified} labelOk="Vérifié" labelKo="Non vérifié" />
            } />
          </dl>
        )}
      </SectionCard>

      {/* ── OE Profile (read-only) ─────────────────────────────────────────── */}
      <SectionCard
        title="Profil Opérateur Économique"
        icon={<Briefcase className="h-4 w-4" />}
      >
        <dl>
          <InfoRow label="Éligibilité" value={
            <StatusBadge ok={oe.is_eligible} labelOk="Éligible" labelKo="Non éligible" />
          } />
          <InfoRow label="Liste noire" value={
            oe.is_blacklisted ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                <AlertTriangle className="h-3 w-3" /> Blacklisté
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                Non blacklisté
              </span>
            )
          } />
          <InfoRow label="Qualifications" value={
            <div className="flex flex-wrap gap-1.5">
              {oe.qualifications.map((q) => (
                <span key={q} className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">{q}</span>
              ))}
            </div>
          } />
          <InfoRow label="Catégories prof." value={
            <div className="flex flex-wrap gap-1.5">
              {oe.categoriesProfessionnelles.map((c) => (
                <span key={c} className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">{c}</span>
              ))}
            </div>
          } />
        </dl>
        <p className="mt-3 text-[11px] text-slate-400">
          Ces informations sont gérées par l&apos;administrateur de la plateforme. Contactez le support pour toute modification.
        </p>
      </SectionCard>
    </div>
  );
}