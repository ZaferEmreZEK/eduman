import { Box, LinearProgress, Typography } from "@mui/material";

export default function UsageProgress({ used, total }: { used: number; total: number }) {
  const value = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 240 }}>
      <Box sx={{ flex: 1 }}>
        <LinearProgress variant="determinate" value={value} sx={{ height: 8, borderRadius: 999 }} color={value >= 100 ? "error" : "warning"} />
      </Box>
      <Typography variant="body2" color="text.secondary">{used} / {total}</Typography>
    </Box>
  );
}

