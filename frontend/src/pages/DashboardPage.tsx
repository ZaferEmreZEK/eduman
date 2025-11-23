import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Paper, Stack, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useQuery } from "@tanstack/react-query";
import { getOverview } from "../api/dashboard";
import MetricCard from "../components/MetricCard";
import SimpleBarChart from "../components/SimpleBarChart";
import { getSummary } from "../api/reports";

export default function DashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const { data } = useQuery({ queryKey: ["overview"], queryFn: getOverview, retry: false, refetchOnWindowFocus: false });
  const { data: summary } = useQuery({ queryKey: ["reports-summary-dashboard"], queryFn: () => getSummary({}), retry: false, refetchOnWindowFocus: false });

  const cards = [
    { title: "Toplam Kurum", value: data?.Institutions ?? 0, variant: "light" as const },
    { title: "Toplam Okul", value: data?.Schools ?? 0, variant: "primary" as const },
    { title: "Toplam Sınıf", value: data?.Classes ?? 0, variant: "light" as const },
    { title: "Toplam Lisans", value: data?.Licenses ?? 0, variant: "dark" as const },
  ];

  return (
    <Box sx={{ width: "100%", px: 3, py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Ana Gösterge Paneli</Typography>
      <Grid container spacing={3}>
        {cards.map((c) => (
          <Grid key={c.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard title={c.title} value={c.value} variant={c.variant} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 2, minHeight: 300 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Aylık Kullanıcı Aktiviteleri</Typography>
            {summary?.monthlyActiveUsers ? (
              <SimpleBarChart data={summary.monthlyActiveUsers} />
            ) : (
              <Typography variant="body2" color="text.secondary">Veri alınamadı.</Typography>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 2, minHeight: 300 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Son İşlemler</Typography>
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">Son lisans kayıtları burada listelenecek.</Typography>
              <Button variant="outlined" size="small" onClick={() => navigate("/licenses")}>Lisanslara Git</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

