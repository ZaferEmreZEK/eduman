import axiosClient from "./axiosClient";

export type Institution = {
  id: string; // GUID
  tenantId: string; // yeni swagger zorunlu alan
  name?: string;
  address?: string;
  type?: "public" | "private"; // kurum tipi (ör: devlet/özel)
};

export type InstitutionPayload = {
  tenantId: string;
  name?: string;
  address?: string;
  type?: "public" | "private";
};

export async function getInstitutions() {
  const { data } = await axiosClient.get<Institution[]>("/Institutions");
  return data;
}

export async function createInstitution(payload: InstitutionPayload) {
  const { data } = await axiosClient.post<Institution>("/Institutions", payload);
  return data;
}

export async function updateInstitution(id: string, payload: InstitutionPayload) {
  await axiosClient.put<void>(`/Institutions/${id}`, payload);
}

export async function deleteInstitution(id: string) {
  await axiosClient.delete<void>(`/Institutions/${id}`);
}
