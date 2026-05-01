import { apiClient } from "@/services/client";

export interface UpdateAdminProfileInput {
  username: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  avatar?: File;
}

export interface AdminProfile {
  id?: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export async function updateAdminProfile(
  payload: UpdateAdminProfileInput,
): Promise<AdminProfile> {
  const formData = new FormData();

  formData.append("username", payload.username);
  formData.append("email", payload.email);

  if (payload.currentPassword) {
    formData.append("currentPassword", payload.currentPassword);
  }

  if (payload.newPassword) {
    formData.append("newPassword", payload.newPassword);
  }

  if (payload.avatar) {
    formData.append("avatar", payload.avatar);
  }

  return apiClient<AdminProfile>("/api/admin/profile", {
    method: "PATCH",
    body: formData,
  });
}
