import { useMemo, useState } from "react";
import { Container, Grid, Paper, Typography, Stack, TextField, MenuItem, Button, LinearProgress, Table, TableHead, TableRow, TableCell, TableBody, Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getInstitutions, type Institution } from "../api/institutions";
import { getSummary, downloadReport } from "../api/reports";
import SimplePieChart from "../components/SimplePieChart";
import SimpleLineChart from "../components/SimpleLineChart";

export default function ReportsPage() {
  const { data: institutions } = useQuery({ queryKey: ["institutions"], queryFn: getInstitutions });
  const [instId, setInstId] = useState<string>("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const { data: summaryData } = useQuery({
    queryKey: ["reports-summary", { instId, start, end }],
    queryFn: () => getSummary({ institutionId: instId || undefined, start: start || undefined, end: end || undefined }),
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Güvenli/normalize edilmiş değerler
  const licenseUsage = useMemo(() => {
    const raw = Number(summaryData?.licenseUsagePercent ?? 0);
    return Math.min(100, Math.max(0, isNaN(raw) ? 0 : raw));
  }, [summaryData]);

  const monthlyData = useMemo(() => {
    const incoming = summaryData?.monthlyActiveUsers ?? [];
    if (incoming.length > 0) return incoming;
    // Kayıt yoksa son 6 ay için 0 değerlerle çiz
    const base: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      base.push({ label: d.toLocaleDateString(undefined, { month: "short" }), value: 0 });
    }
    return base;
  }, [summaryData]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Raporlar</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <TextField select label="Kurum" value={instId} onChange={(e) => setInstId(e.target.value)} sx={{ minWidth: 240 }}>
            <MenuItem value="">Tüm Kurumlar</MenuItem>
            {(institutions ?? []).map((ins: Institution) => (
              <MenuItem key={ins.id} value={ins.id}>{ins.name}</MenuItem>
            ))}
          </TextField>
          <TextField type="date" label="Başlangıç Tarihi" InputLabelProps={{ shrink: true }} value={start} onChange={(e) => setStart(e.target.value)} />
          <TextField type="date" label="Bitiş Tarihi" InputLabelProps={{ shrink: true }} value={end} onChange={(e) => setEnd(e.target.value)} />
          <Button variant="contained" onClick={async () => {
            const blob = await downloadReport({ institutionId: instId || undefined, start: start || undefined, end: end || undefined, format: "pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "rapor.pdf";
            a.click();
            URL.revokeObjectURL(url);
          }}>Rapor İndir</Button>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 2, minHeight: 260 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Lisans Kullanım Oranı</Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              <SimplePieChart percent={licenseUsage} label="Kullanım" />
              <Typography variant="body2" color="text.secondary">Kullanımda: {licenseUsage}%  —  Boş: {100 - licenseUsage}%</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 2, minHeight: 260 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Aylara Göre Aktif Kullanıcı Sayısı</Typography>
            <SimpleLineChart data={monthlyData} />
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Kurum Bazlı Özet İstatistikler</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Kurum</TableCell>
              <TableCell>Aktif Kullanıcı</TableCell>
              <TableCell>Toplam Kullanıcı</TableCell>
              <TableCell>Lisans Sayısı</TableCell>
              <TableCell>Ortalama Aktivite</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(summaryData?.institutionSummary ?? []).map((s) => (
              <TableRow key={s.name} hover>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.active}</TableCell>
                <TableCell>{s.total}</TableCell>
                <TableCell>
                  <Chip size="small" label={`${s.licenses} Lisans`} color="primary" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <LinearProgress variant="determinate" value={Math.min(100, Math.max(0, Number(s.avg ?? 0)))} sx={{ width: 220, height: 8, borderRadius: 999 }} />
                    <Typography variant="body2" color="text.secondary">{Math.min(100, Math.max(0, Number(s.avg ?? 0)))}%</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
















