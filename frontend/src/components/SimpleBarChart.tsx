import { Box } from "@mui/material";

type Point = { label: string; value: number };

export default function SimpleBarChart({ data, max }: { data: Point[]; max?: number }) {
  const m = max ?? Math.max(1, ...data.map(d => d.value));
  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, height: 220, px: 2 }}>
      {data.map((d) => (
        <Box key={d.label} sx={{ textAlign: "center", flex: 1 }}>
          <Box sx={{
            height: `${(d.value / m) * 170}px`,
            backgroundColor: "#2F73FF",
            borderRadius: 1.5,
            boxShadow: "0 4px 10px rgba(47,115,255,.35)",
          }} />
          <Box sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>{d.label}</Box>
        </Box>
      ))}
    </Box>
  );
}

