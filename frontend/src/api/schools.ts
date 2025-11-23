import axiosClient from "./axiosClient";

export type School = {
  id: string; // GUID
  name: string;
  institutionId: string;
  address?: string;
  branchCount?: number; // şube sayısı
};

export async function getSchoolsByInstitution(institutionId: string) {
  const { data } = await axiosClient.get<School[]>(
    `/Schools/institution/${institutionId}`
  );
  return data;
}

export async function createSchool(payload: Partial<School>) {
  const { data } = await axiosClient.post<School>("/Schools", payload);
  return data;
}

export async function updateSchool(id: string, payload: Partial<School>) {
  await axiosClient.put<void>(`/Schools/${id}`, payload);
}

export async function deleteSchool(id: string) {
  await axiosClient.delete<void>(`/Schools/${id}`);
}
