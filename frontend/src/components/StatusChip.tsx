import { Chip } from "@mui/material";

export type StatusKind = "active" | "demo" | "expiring" | "passive";

export default function StatusChip({ status, label }: { status: StatusKind; label?: string }) {
  const map: Record<StatusKind, { color: "success" | "warning" | "default"; text: string }> = {
    active: { color: "success", text: "Aktif" },
    demo: { color: "default", text: "Demo" },
    expiring: { color: "warning", text: "Süresi Dolmak Üzere" },
    passive: { color: "default", text: "Pasif" },
  };
  const cfg = map[status];
  return <Chip color={cfg.color} variant={cfg.color === "default" ? "outlined" : "filled"} label={label ?? cfg.text} />;
}

