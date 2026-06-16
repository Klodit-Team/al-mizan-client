"use client";
import { useState, useEffect, useCallback } from "react";
import { type User, type RoleEntity } from "./types";
import {
  getAdminRoles,
  assignUserRole,
  getUserRoles,
  removeUserRole,
  createRole,
} from "@/services/admin/users";
import { getProfileByUserId } from "@/services/admin/users/api";
import {
  blacklistAdminOperateur,
  unblacklistAdminOperateur,
} from "@/services/admin/operateurs";

import type { getDictionary } from "@/i18n/get-dictionaries";

type CommonDict = Awaited<ReturnType<typeof getDictionary>>;

interface UsersPageProps {
  locale: string;
  dict: CommonDict["dashboard"]["admin"]["usersPage"];
}

export default function UsersPage({ locale, dict }: UsersPageProps) {
  const roleLabels: Record<string, string> = {
    ADMIN: dict.roles?.ADMIN ?? "Admin",
    SERVICE_CONTRACTANT: dict.roles?.SERVICE_CONTRACTANT ?? "Service Contractant",
    OPERATEUR_ECONOMIQUE: dict.roles?.OPERATEUR_ECONOMIQUE ?? "Opérateur Économique",
    MEMBRE_COMMISSION: dict.roles?.MEMBRE_COMMISSION ?? "Membre Commission",
    CONTROLEUR: dict.roles?.CONTROLEUR ?? "Contrôleur",
  };

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleEntity[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [blacklistModal, setBlacklistModal] = useState<{
    isOpen: boolean;
    user: User | null;
    motif: string;
  }>({ isOpen: false, user: null, motif: "" });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [createRoleModal, setCreateRoleModal] = useState<{
    isOpen: boolean;
    name: string;
    description: string;
    isSubmitting: boolean;
  }>({ isOpen: false, name: "", description: "", isSubmitting: false });

  // ─── Fetch Roles ───────────────────────────────────────────────────────────

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const roleList = await getAdminRoles();
      setRoles(roleList);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // ─── Search User ───────────────────────────────────────────────────────────

  const handleSearchUser = async () => {
    const userId = search.trim();
    if (!userId) {
      setUsers([]);
      setSearchError(null);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    try {
      const profile = await getProfileByUserId(userId);
      let assignments: any[] = [];
      try {
        assignments = await getUserRoles(profile.userId);
      } catch (err) {
        console.error("Failed to fetch user roles", err);
      }

      setUsers([
        {
          id: profile.id,
          userId: profile.userId,
          username: `${profile.prenom} ${profile.nom}`,
          nom: profile.nom,
          prenom: profile.prenom,
          telephone: profile.telephone,
          langue: profile.langue,
          email: "",
          assignedRoles: assignments,
          createdAt: profile.createdAt,
          is_active: true,
          is_blacklisted: false,
        },
      ]);
    } catch (error: any) {
      console.error("User not found or error:", error);
      setUsers([]);
      if (error?.status === 404 || error?.response?.status === 404) {
        setSearchError("Aucun profil trouvé pour cet utilisateur.");
      } else {
        setSearchError("Une erreur est survenue lors de la recherche du profil.");
      }
    } finally {
      setSearchLoading(false);
    }
  };

  // ─── Role Assignments ──────────────────────────────────────────────────────

  const handleAddRole = async (userId: string, roleId: string) => {
    if (!roleId) return;
    setErrorMsg(null);
    try {
      const newAssignment = await assignUserRole({ userId, roleId });
      setUsers((prev) =>
        prev.map((u) => {
          if (u.userId === userId) {
            return {
              ...u,
              assignedRoles: [...u.assignedRoles, newAssignment],
            };
          }
          return u;
        })
      );
      setSuccessMsg("Rôle attribué avec succès.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error) {
      console.error("Error assigning role:", error);
      setErrorMsg("Erreur lors de l'attribution du rôle. Veuillez réessayer.");
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    setErrorMsg(null);
    try {
      await removeUserRole(userId, roleId);
      setUsers((prev) =>
        prev.map((u) => {
          if (u.userId === userId) {
            return {
              ...u,
              assignedRoles: u.assignedRoles.filter((r) => r.roleId !== roleId),
            };
          }
          return u;
        })
      );
      setSuccessMsg("Rôle retiré avec succès.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error) {
      console.error("Error removing role:", error);
      setErrorMsg("Erreur lors de la suppression du rôle. Veuillez réessayer.");
    }
  };

  // ─── Create Role ───────────────────────────────────────────────────────────

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateRoleModal((prev) => ({ ...prev, isSubmitting: true }));
    setErrorMsg(null);
    try {
      await createRole({
        name: createRoleModal.name.toUpperCase(),
        description: createRoleModal.description,
      });
      await fetchRoles(); // refresh list
      setCreateRoleModal({ isOpen: false, name: "", description: "", isSubmitting: false });
      setSuccessMsg("Rôle créé avec succès.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error) {
      console.error("Error creating role:", error);
      setErrorMsg("Erreur lors de la création du rôle. Veuillez réessayer.");
      setCreateRoleModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // ─── Blacklist ─────────────────────────────────────────────────────────────

  const handleBlacklistSubmit = async () => {
    if (!blacklistModal.user) return;
    const { id: oeId, userId } = blacklistModal.user;

    setUsers((prev) =>
      prev.map((u) =>
        u.userId === userId
          ? { ...u, is_blacklisted: true, blacklist_motif: blacklistModal.motif, is_active: false }
          : u
      )
    );

    try {
      await blacklistAdminOperateur(oeId, blacklistModal.motif);
    } catch (error) {
      console.error("Error blacklisting user:", error);
    } finally {
      setBlacklistModal({ isOpen: false, user: null, motif: "" });
    }
  };

  const handleRemoveBlacklist = async (oeId: string, userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.userId === userId
          ? { ...u, is_blacklisted: false, blacklist_motif: undefined, is_active: true }
          : u
      )
    );

    try {
      await unblacklistAdminOperateur(oeId);
    } catch (error) {
      console.error("Error removing blacklist:", error);
    }
  };

  // ─── Helper ────────────────────────────────────────────────────────────────

  const getRoleNameById = (id: string) => {
    const role = roles.find((r) => r.id === id);
    if (!role) return "Inconnu";
    return roleLabels[role.name] ?? role.name;
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{dict.title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{dict.subtitle}</p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMsg}
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Rechercher par ID Utilisateur (UUID)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchUser()}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-green-100 focus:border-[#4CAF50] bg-white text-gray-700"
            />
          </div>
          <button
            onClick={handleSearchUser}
            disabled={searchLoading}
            className="px-4 py-2.5 bg-[#4CAF50] text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-70"
          >
            {searchLoading ? "Recherche..." : "Rechercher"}
          </button>
          {(users.length > 0 || searchError) && (
            <button
              onClick={() => {
                setSearch("");
                setUsers([]);
                setSearchError(null);
              }}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Effacer
            </button>
          )}
        </div>
        {searchError && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 max-w-lg flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {searchError}
          </div>
        )}
      </div>

      {/* Users table (when searched) OR Roles table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">
            {users.length > 0 ? "Résultat de la recherche" : "Liste des Rôles Système"}
          </h2>
          <div className="flex items-center gap-3">
            {(isLoading || searchLoading) && (
              <span className="text-xs text-gray-400 animate-pulse">Chargement…</span>
            )}
            {users.length === 0 && (
              <button
                onClick={() => setCreateRoleModal((p) => ({ ...p, isOpen: true }))}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                + Créer un Rôle
              </button>
            )}
          </div>
        </div>

        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {dict.columns?.name ?? "Nom"}
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {dict.columns?.role ?? "Rôles"}
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {dict.columns?.status ?? "Statut"}
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {dict.columns?.actions ?? "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: "#1e2535" }}
                        >
                          {`${user.prenom[0] ?? ""}${user.nom[0] ?? ""}`.toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700 block">
                            {user.prenom} {user.nom}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{user.userId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 align-top pt-4">
                      {user.telephone ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3 align-top">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {user.assignedRoles.map((ur) => (
                          <div
                            key={ur.roleId}
                            className="flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-semibold"
                          >
                            <span>{getRoleNameById(ur.roleId)}</span>
                            <button
                              onClick={() => handleRemoveRole(user.userId, ur.roleId)}
                              className="text-blue-400 hover:text-red-500 hover:bg-white rounded-full p-0.5 transition-colors"
                              title="Retirer ce rôle"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        {user.assignedRoles.length === 0 && (
                          <span className="text-xs text-gray-400 italic py-1">Aucun rôle</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <select
                          className="text-xs font-semibold px-2 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 outline-none focus:border-[#4CAF50] cursor-pointer"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddRole(user.userId, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Ajouter un rôle...</option>
                          {roles
                            .filter((r) => !user.assignedRoles.some((ur) => ur.roleId === r.id))
                            .map((role) => (
                              <option key={role.id} value={role.id}>
                                {roleLabels[role.name] ?? role.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-3 align-top pt-4">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          user.is_blacklisted
                            ? "bg-red-50 text-red-600"
                            : user.is_active
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                        title={user.is_blacklisted ? user.blacklist_motif : undefined}
                      >
                        {user.is_blacklisted
                          ? dict.statusLabels?.blacklisted ?? "Blacklisté"
                          : user.is_active
                          ? dict.statusLabels?.active ?? "Actif"
                          : dict.statusLabels?.inactive ?? "Inactif"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right align-top pt-4">
                      {user.assignedRoles.some((r) => {
                        const roleObj = roles.find((ro) => ro.id === r.roleId);
                        return roleObj?.name === "OPERATEUR_ECONOMIQUE";
                      }) &&
                        (!user.is_blacklisted ? (
                          <button
                            onClick={() => setBlacklistModal({ isOpen: true, user, motif: "" })}
                            className="text-xs font-semibold px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors border border-red-100"
                          >
                            {dict.actionsLabels?.blacklist ?? "Blacklister"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRemoveBlacklist(user.id, user.userId)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors border border-gray-200"
                          >
                            {dict.actionsLabels?.unblacklist ?? "Dé-blacklister"}
                          </button>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/3">
                    ID du Rôle
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/3">
                    Nom du Rôle
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/3">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-3"><div className="h-4 w-48 bg-gray-100 rounded" /></td>
                      <td className="px-5 py-3"><div className="h-4 w-32 bg-gray-100 rounded" /></td>
                      <td className="px-5 py-3"><div className="h-4 w-full bg-gray-100 rounded" /></td>
                    </tr>
                  ))
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-sm text-gray-400">
                      Aucun rôle trouvé
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-xs font-mono text-gray-500">
                        {role.id}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700">
                          {roleLabels[role.name] ?? role.name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {role.description || "Aucune description"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Role Modal */}
      {createRoleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateRole} className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Créer un nouveau rôle</h3>
              <button
                type="button"
                onClick={() => setCreateRoleModal({ isOpen: false, name: "", description: "", isSubmitting: false })}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du rôle (ex: SUPER_ADMIN)</label>
                <input
                  type="text"
                  value={createRoleModal.name}
                  onChange={(e) => setCreateRoleModal({ ...createRoleModal, name: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm bg-white text-gray-900 uppercase"
                  placeholder="NOM_DU_ROLE"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={createRoleModal.description}
                  onChange={(e) => setCreateRoleModal({ ...createRoleModal, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm bg-white text-gray-900"
                  rows={3}
                  placeholder="Description des permissions du rôle..."
                  required
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCreateRoleModal({ isOpen: false, name: "", description: "", isSubmitting: false })}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!createRoleModal.name.trim() || createRoleModal.isSubmitting}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {createRoleModal.isSubmitting ? "Création..." : "Créer le rôle"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blacklist Modal */}
      {blacklistModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{dict.modal?.title ?? "Blacklister l'utilisateur"}</h3>
              <button
                onClick={() => setBlacklistModal({ isOpen: false, user: null, motif: "" })}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                {dict.modal?.warning1 ?? "Vous êtes sur le point de blacklister"}
                <strong>
                  {blacklistModal.user?.prenom} {blacklistModal.user?.nom}
                </strong>
                . {dict.modal?.warning2 ?? "Veuillez indiquer le motif."}
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {dict.modal?.motifLabel ?? "Motif"}
                </label>
                <textarea
                  value={blacklistModal.motif}
                  onChange={(e) =>
                    setBlacklistModal({ ...blacklistModal, motif: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 text-sm bg-white text-gray-900"
                  rows={4}
                  placeholder={dict.modal?.motifPlaceholder ?? "Motif du blacklist..."}
                  required
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setBlacklistModal({ isOpen: false, user: null, motif: "" })}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {dict.modal?.cancel ?? "Annuler"}
              </button>
              <button
                onClick={handleBlacklistSubmit}
                disabled={!blacklistModal.motif.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dict.modal?.confirm ?? "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
