import axiosClient from "./axiosClient";

export type ClassItem = {
  id: string; // GUID
  level?: string;
  section?: string;
  schoolId: string;
};

export async function getClassesBySchool(schoolId: string) {
  const { data } = await axiosClient.get<ClassItem[]>(
    `/Classes/school/${schoolId}`
  );
  return data;
}

export async function createClass(payload: Partial<ClassItem>) {
  const { data } = await axiosClient.post<ClassItem>("/Classes", payload);
  return data;
}

export async function deleteClass(id: string) {
  await axiosClient.delete<void>(`/Classes/${id}`);
}
