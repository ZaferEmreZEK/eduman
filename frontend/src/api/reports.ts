import axiosClient from "./axiosClient";

export type MonthlyPoint = { label: string; value: number };
export type InstitutionRow = { name: string; active: number; total: number; licenses: number; avg: number };
export type ReportsSummary = {
  licenseUsagePercent: number;
  monthlyActiveUsers: MonthlyPoint[];
  institutionSummary: InstitutionRow[];
};

export type SummaryParams = {
  institutionId?: string;
  start?: string; // yyyy-mm-dd
  end?: string;   // yyyy-mm-dd
};

export async function getSummary(params?: SummaryParams) {
  const { data } = await axiosClient.get<ReportsSummary>("/Reports/summary", { params });
  return data;
}

export async function downloadReport(params: SummaryParams & { format?: "pdf" | "csv" }) {
  const res = await axiosClient.get("/Reports/download", {
    params,
    responseType: "blob",
  });
  return res.data as Blob;
}

