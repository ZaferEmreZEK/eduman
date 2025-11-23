import axiosClient from "./axiosClient";

export type UserDto = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  institutionId?: string | null;
  status: "active" | "inactive";
};

// UI'da kullanilan User tipi (status: active|passive)
export type User = {
  id: string;
  fullName: string;
  email: string;
  role: string; // role id ya da ad – UI, rolleri listeden eşleştirir
  institutionId: string;
  status?: "active" | "passive";
};

export async function getCurrentUser() {
  const { data } = await axiosClient.get<UserDto>("/Users/me");
  return data;
}

// Yönetim sayfası için listeleme
export async function getUsers(filters: {
  institutionId?: string;
  role?: string;
  status?: "active" | "passive";
  q?: string;
}) {
  const params: any = { ...filters };
  if (params.status) params.status = params.status === "passive" ? "inactive" : "active";
  const { data } = await axiosClient.get<UserDto[]>("/Users", { params });
  return (data ?? []).map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    institutionId: (u.institutionId ?? "") as string,
    status: u.status === "inactive" ? "passive" : "active",
  })) as User[];
}

export async function createUser(payload: Partial<User>, password?: string) {
  const body: any = { ...payload };
  if (body.status) body.status = body.status === "passive" ? "inactive" : "active";
  const normalizedPassword = password?.trim();
  const params = normalizedPassword ? { password: normalizedPassword } : undefined;
  const { data } = await axiosClient.post<UserDto>("/Users", body, { params });
  return {
    id: data.id,
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    institutionId: (data.institutionId ?? "") as string,
    status: data.status === "inactive" ? "passive" : "active",
  } as User;
}

export async function updateUser(id: string, payload: Partial<User>) {
  const body: any = { ...payload };
  if (body.status) body.status = body.status === "passive" ? "inactive" : "active";
  await axiosClient.put<void>(`/Users/${id}`, body);
}

export async function deleteUser(id: string) {
  await axiosClient.delete<void>(`/Users/${id}`);
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  await axiosClient.post<void>(`/Users/change-password`, payload);
}
