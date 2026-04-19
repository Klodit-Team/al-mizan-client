"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Building2, Pencil, Save, Shield, User, X } from "lucide-react";

import {
  getServiceContractantProfile,
  updateServiceContractantProfile,
  type ServiceContractantProfile,
} from "@/services/contractantProfile";

interface MyProfilePageProps {
  locale: string;
}

function Label({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
      {children}
    </p>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 border-b border-slate-100 py-2.5 last:border-0 sm:grid-cols-[220px_1fr]">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="text-xs text-slate-700">{value}</dd>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 outline-none transition-colors focus:border-[#4CAF50] focus:bg-white"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 outline-none transition-colors focus:border-[#4CAF50] focus:bg-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function getVerificationLabel(status: string) {
  switch (status) {
    case "verifie":
      return "Verifie";
    case "en_attente":
      return "En attente";
    case "non_verifie":
      return "Non verifie";
    default:
      return status;
  }
}

function getVerificationClass(status: string) {
  switch (status) {
    case "verifie":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "en_attente":
      return "border-amber-200 bg-amber-100 text-amber-700";
    case "non_verifie":
      return "border-red-200 bg-red-100 text-red-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export default function MyProfilePage({ locale }: MyProfilePageProps) {
  const [profile, setProfile] = useState<ServiceContractantProfile | null>(
    null,
  );
  const [draft, setDraft] = useState<ServiceContractantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getServiceContractantProfile();
      setProfile(response);
      setDraft(response);
    } catch {
      setError("Impossible de charger le profil.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  if (isLoading || !profile || !draft) {
    return (
      <div className="space-y-3">
        <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  const fullName = `${profile.userInfo.firstName} ${profile.userInfo.lastName}`;

  const saveProfile = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await updateServiceContractantProfile(draft);
      setProfile(updated);
      setDraft(updated);
      setIsEditing(false);
      setSuccessMessage("Profil mis a jour avec succes.");
    } catch {
      setError("Impossible de sauvegarder le profil.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setDraft(profile);
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              My Profile
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">{fullName}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setDraft(profile);
                  setIsEditing(true);
                  setSuccessMessage(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "#4CAF50" }}
                >
                  <Save className="h-3.5 w-3.5" />
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </>
            )}

            <Link
              href={`/${locale}/dashboard/contractant/securite`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              <Shield className="h-3.5 w-3.5" />
              Change password
            </Link>
          </div>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600">
            User info
          </h2>
        </div>

        {isEditing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Nom"
              value={draft.userInfo.lastName}
              onChange={(value) =>
                setDraft((prev) =>
                  prev
                    ? {
                        ...prev,
                        userInfo: { ...prev.userInfo, lastName: value },
                      }
                    : prev,
                )
              }
            />
            <Field
              label="Prenom"
              value={draft.userInfo.firstName}
              onChange={(value) =>
                setDraft((prev) =>
                  prev
                    ? {
                        ...prev,
                        userInfo: { ...prev.userInfo, firstName: value },
                      }
                    : prev,
                )
              }
            />
            <Field
              label="Email"
              value={draft.userInfo.email}
              type="email"
              onChange={(value) =>
                setDraft((prev) =>
                  prev
                    ? { ...prev, userInfo: { ...prev.userInfo, email: value } }
                    : prev,
                )
              }
            />
            <Field
              label="Telephone"
              value={draft.userInfo.phone}
              onChange={(value) =>
                setDraft((prev) =>
                  prev
                    ? { ...prev, userInfo: { ...prev.userInfo, phone: value } }
                    : prev,
                )
              }
            />
            <SelectField
              label="Langue preferee"
              value={draft.userInfo.preferredLanguage}
              options={["fr", "ar"]}
              onChange={(value) =>
                setDraft((prev) =>
                  prev
                    ? {
                        ...prev,
                        userInfo: {
                          ...prev.userInfo,
                          preferredLanguage: value as "fr" | "ar",
                        },
                      }
                    : prev,
                )
              }
            />
          </div>
        ) : (
          <dl>
            <InfoRow label="Nom" value={profile.userInfo.lastName} />
            <InfoRow label="Prenom" value={profile.userInfo.firstName} />
            <InfoRow label="Email" value={profile.userInfo.email} />
            <InfoRow label="Telephone" value={profile.userInfo.phone} />
            <InfoRow
              label="Langue preferee"
              value={
                profile.userInfo.preferredLanguage === "fr"
                  ? "Francais"
                  : "Arabe"
              }
            />
          </dl>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-400" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600">
            Organisation info
          </h2>
        </div>

        {isEditing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field
                label="Denomination"
                value={draft.organizationInfo.denomination}
                onChange={(value) =>
                  setDraft((prev) =>
                    prev
                      ? {
                          ...prev,
                          organizationInfo: {
                            ...prev.organizationInfo,
                            denomination: value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
            <Field
              label="NIF"
              value={draft.organizationInfo.nif}
              onChange={(value) =>
                setDraft((prev) =>
                  prev
                    ? {
                        ...prev,
                        organizationInfo: {
                          ...prev.organizationInfo,
                          nif: value,
                        },
                      }
                    : prev,
                )
              }
            />
            <Field
              label="NIS"
              value={draft.organizationInfo.nis}
              onChange={(value) =>
                setDraft((prev) =>
                  prev
                    ? {
                        ...prev,
                        organizationInfo: {
                          ...prev.organizationInfo,
                          nis: value,
                        },
                      }
                    : prev,
                )
              }
            />
            <Field
              label="RC"
              value={draft.organizationInfo.rc}
              onChange={(value) =>
                setDraft((prev) =>
                  prev
                    ? {
                        ...prev,
                        organizationInfo: {
                          ...prev.organizationInfo,
                          rc: value,
                        },
                      }
                    : prev,
                )
              }
            />
            <Field
              label="Type organisation"
              value={draft.organizationInfo.organizationType}
              onChange={(value) =>
                setDraft((prev) =>
                  prev
                    ? {
                        ...prev,
                        organizationInfo: {
                          ...prev.organizationInfo,
                          organizationType: value,
                        },
                      }
                    : prev,
                )
              }
            />
            <Field
              label="Wilaya"
              value={draft.organizationInfo.wilaya}
              onChange={(value) =>
                setDraft((prev) =>
                  prev
                    ? {
                        ...prev,
                        organizationInfo: {
                          ...prev.organizationInfo,
                          wilaya: value,
                        },
                      }
                    : prev,
                )
              }
            />
            <div className="sm:col-span-2">
              <Field
                label="Adresse"
                value={draft.organizationInfo.address}
                onChange={(value) =>
                  setDraft((prev) =>
                    prev
                      ? {
                          ...prev,
                          organizationInfo: {
                            ...prev.organizationInfo,
                            address: value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
          </div>
        ) : (
          <dl>
            <InfoRow
              label="Denomination"
              value={profile.organizationInfo.denomination}
            />
            <InfoRow label="NIF" value={profile.organizationInfo.nif} />
            <InfoRow label="NIS" value={profile.organizationInfo.nis} />
            <InfoRow label="RC" value={profile.organizationInfo.rc} />
            <InfoRow label="Adresse" value={profile.organizationInfo.address} />
            <InfoRow label="Wilaya" value={profile.organizationInfo.wilaya} />
            <InfoRow
              label="Type organisation"
              value={profile.organizationInfo.organizationType}
            />
            <div className="grid grid-cols-1 gap-0.5 py-2.5 sm:grid-cols-[220px_1fr]">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Statut verification
              </dt>
              <dd>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getVerificationClass(
                    profile.organizationInfo.verificationStatus,
                  )}`}
                >
                  {getVerificationLabel(
                    profile.organizationInfo.verificationStatus,
                  )}
                </span>
              </dd>
            </div>
          </dl>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-slate-400" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600">
            SC info
          </h2>
        </div>

        {isEditing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Code service"
              value={draft.serviceInfo.serviceCode}
              onChange={(value) =>
                setDraft((prev) =>
                  prev
                    ? {
                        ...prev,
                        serviceInfo: {
                          ...prev.serviceInfo,
                          serviceCode: value,
                        },
                      }
                    : prev,
                )
              }
            />
            <Field
              label="Ordonnateur"
              value={draft.serviceInfo.ordonnateur}
              onChange={(value) =>
                setDraft((prev) =>
                  prev
                    ? {
                        ...prev,
                        serviceInfo: {
                          ...prev.serviceInfo,
                          ordonnateur: value,
                        },
                      }
                    : prev,
                )
              }
            />
            <div className="sm:col-span-2">
              <Field
                label="Secteur d'activite"
                value={draft.serviceInfo.activitySector}
                onChange={(value) =>
                  setDraft((prev) =>
                    prev
                      ? {
                          ...prev,
                          serviceInfo: {
                            ...prev.serviceInfo,
                            activitySector: value,
                          },
                        }
                      : prev,
                  )
                }
              />
            </div>
          </div>
        ) : (
          <dl>
            <InfoRow
              label="Code service"
              value={profile.serviceInfo.serviceCode}
            />
            <InfoRow
              label="Secteur d'activite"
              value={profile.serviceInfo.activitySector}
            />
            <InfoRow
              label="Ordonnateur"
              value={profile.serviceInfo.ordonnateur}
            />
          </dl>
        )}
      </section>
    </div>
  );
}
