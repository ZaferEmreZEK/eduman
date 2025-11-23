import { Box, Typography } from "@mui/material";

export default function SimplePieChart({ percent, label }: { percent: number; label?: string }) {
  const size = 160;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference * (1 - clamped / 100);

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E6EAF2" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2F73FF"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <Typography variant="subtitle1" sx={{ position: "absolute" }}>{label ?? `${clamped}%`}</Typography>
    </Box>
  );
}
