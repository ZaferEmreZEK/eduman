import axiosClient from "./axiosClient";

export type Overview = {
  Institutions: number;
  Schools: number;
  Classes: number;
  Licenses: number;
};

// Backend anahtarları farklı büyük/küçük harflerle dönse de eşleştir.
function normalize(o: any): Overview {
  const g = (k: string) => {
    const entry = Object.entries(o ?? {}).find(([kk]) => kk.toLowerCase() === k.toLowerCase());
    return entry ? Number(entry[1] ?? 0) : 0;
  };
  return {
    Institutions: g("Institutions"),
    Schools: g("Schools"),
    Classes: g("Classes"),
    Licenses: g("Licenses"),
  };
}

export async function getOverview() {
  const { data } = await axiosClient.get<unknown>("/Dashboard/overview");
  return normalize(data);
}
