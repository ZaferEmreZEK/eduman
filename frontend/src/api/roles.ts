import axiosClient from "./axiosClient";

export type Role = {
  id: string; // GUID
  name: string;
  description?: string;
};

export async function getRoles() {
  const { data } = await axiosClient.get<Role[]>(`/Roles`);
  return data;
}

export async function createRole(payload: Partial<Role>) {
  const { data } = await axiosClient.post<Role>(`/Roles`, payload);
  return data;
}

export async function updateRole(id: string, payload: Partial<Role>) {
  await axiosClient.put<void>(`/Roles/${id}`, payload);
}

export async function deleteRole(id: string) {
  await axiosClient.delete<void>(`/Roles/${id}`);
}

export async function getRolePermissions(id: string) {
  const { data } = await axiosClient.get<string[]>(`/Roles/${id}/permissions`);
  return data;
}

export async function updateRolePermissions(id: string, permissions: string[]) {
  await axiosClient.put<void>(`/Roles/${id}/permissions`, { permissions });
}

