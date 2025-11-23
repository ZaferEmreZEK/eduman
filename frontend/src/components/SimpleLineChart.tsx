import { Box } from "@mui/material";

type Point = { label: string; value: number };

export default function SimpleLineChart({ data, max }: { data: Point[]; max?: number }) {
  const m = max ?? Math.max(1, ...data.map((d) => d.value));
  const width = 500;
  const height = 220;
  const padding = 24;
  const stepX = (width - padding * 2) / (data.length - 1 || 1);
  const scaleY = (v: number) => height - padding - (v / m) * (height - padding * 2);
  const points = data.map((d, i) => `${padding + i * stepX},${scaleY(d.value)}`).join(" ");

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        <polyline
          fill="none"
          stroke="#2F73FF"
          strokeWidth="3"
          points={points}
        />
        {data.map((d, i) => (
          <circle key={i} cx={padding + i * stepX} cy={scaleY(d.value)} r={4} fill="#2F73FF" />
        ))}
      </svg>
    </Box>
  );
}

