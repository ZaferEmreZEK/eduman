import axiosClient from "./axiosClient";

export type License = {
  id: string; // GUID
  licenseKey: string;
  startDate: string; // ISO
  endDate: string; // ISO
  institutionId: string;
  // optional alanlar - backend eklediğinde otomatik kullanılır
  demo?: boolean;
  isDemo?: boolean;
  userLimit?: number;
  usedUsers?: number;
  status?: "active" | "demo" | "expiring" | "passive";
  type?: string;
};

export async function getLicensesByInstitution(institutionId: string) {
  const { data } = await axiosClient.get<License[]>(`/Licenses/institution/${institutionId}`);
  // Alan adlarını UI ile uyumlu hale getir (isDemo -> demo)
  return (data ?? []).map((d: any) => ({
    ...d,
    demo: d?.demo ?? d?.isDemo,
  }));
}

export async function createLicense(payload: Partial<License>) {
  const { data } = await axiosClient.post<License>("/Licenses", payload);
  return data;
}
