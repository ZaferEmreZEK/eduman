import { Card, CardContent, Typography } from "@mui/material";

export default function MetricCard({ title, value, variant = "light" }: { title: string; value: number | string; variant?: "light" | "dark" | "primary" }) {
  const styles = {
    light: { bg: "#fff", color: "inherit" },
    dark: { bg: "linear-gradient(90deg, #0F3D89 0%, #0A2E5C 100%)", color: "#fff" },
    primary: { bg: "linear-gradient(90deg, #2F73FF 0%, #0F3D89 100%)", color: "#fff" },
  }[variant];

  return (
    <Card sx={{ background: styles.bg, color: styles.color }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>{title}</Typography>
        <Typography variant="h4" fontWeight={700}>{value}</Typography>
      </CardContent>
    </Card>
  );
}
