import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Chip,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getInstitutions } from "../api/institutions";
import type { Institution } from "../api/institutions";
import type { License } from "../api/licenses";
import { createLicense, getLicensesByInstitution } from "../api/licenses";
import UsageProgress from "../components/UsageProgress";
import StatusChip from "../components/StatusChip";

export default function LicensesPage() {
  const qc = useQueryClient();
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>("");

  const { data: institutions } = useQuery({ queryKey: ["institutions"], queryFn: getInstitutions });

  const { data: licenses, refetch } = useQuery({
    queryKey: ["licenses", selectedInstitutionId],
    queryFn: () => getLicensesByInstitution(selectedInstitutionId),
    enabled: !!selectedInstitutionId,
  });

  useEffect(() => {
    if (!selectedInstitutionId && institutions?.length) {
      setSelectedInstitutionId(institutions[0].id);
    }
  }, [institutions, selectedInstitutionId]);

  const [open, setOpen] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [userLimit, setUserLimit] = useState<number | "">("");
  const [licenseType, setLicenseType] = useState<string>("");

  const createMut = useMutation({
    mutationFn: createLicense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["licenses", selectedInstitutionId] });
      setOpen(false);
      setLicenseKey("");
      setStartDate("");
      setEndDate("");
      setErrorMsg("");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.title || err?.response?.data?.detail || err?.message || "İşlem başarısız";
      setErrorMsg(String(msg));
    },
  });

  const onSubmit = async () => {
    if (!selectedInstitutionId) return;
    await createMut.mutateAsync({
      licenseKey,
      startDate,
      endDate,
      institutionId: selectedInstitutionId,
      userLimit: userLimit === "" ? undefined : Number(userLimit),
      type: licenseType || undefined,
      isDemo: licenseType === "demo",
    });
  };

  const warningText = selectedInstitutionId ? "" : "Kurum seçmeden lisans işlemi yapılamaz.";

  return (
    <Container sx={{ py: 4 }}>
      {warningText && (
        <Alert severity="warning" sx={{ mb: 2 }}>{warningText}</Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5">Lisanslar</Typography>
          <Button variant="contained" disabled={!selectedInstitutionId} onClick={() => setOpen(true)}>Yeni Lisans</Button>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
          <TextField
            select
            label="Kurum"
            value={selectedInstitutionId}
            onChange={(e) => setSelectedInstitutionId(e.target.value)}
            sx={{ minWidth: 240 }}
          >
            <MenuItem value="" disabled>
              {institutions?.length ? "Kurum seçiniz" : "Kurum yok / Yükleniyor"}
            </MenuItem>
            {(institutions ?? []).map((ins: Institution) => (
              <MenuItem key={ins.id} value={ins.id}>{ins.name}</MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={() => refetch()} disabled={!selectedInstitutionId}>Yenile</Button>
        </Stack>

        {!selectedInstitutionId && <Typography>Kurum seçiniz.</Typography>}

        {selectedInstitutionId && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>License Key</TableCell>
                <TableCell>Kullanıcı Limiti</TableCell>
                <TableCell>Başlangıç</TableCell>
                <TableCell>Bitiş</TableCell>
                <TableCell>Demo</TableCell>
                <TableCell>Durum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(licenses ?? []).map((lic: License) => (
                <TableRow key={lic.id} hover>
                  <TableCell>{lic.id}</TableCell>
                  <TableCell>{lic.licenseKey}</TableCell>
                  <TableCell>
                    {typeof lic.usedUsers === "number" && typeof lic.userLimit === "number" ? (
                      <UsageProgress used={lic.usedUsers} total={lic.userLimit} />
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>{new Date(lic.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(lic.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {lic.demo !== undefined ? (
                      <Chip size="small" label={lic.demo ? "Evet" : "Hayır"} variant={lic.demo ? "filled" : "outlined"} color={lic.demo ? "primary" : "default"} />
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {lic.status ? <StatusChip status={lic.status as any} /> : <Typography variant="body2" color="text.secondary">-</Typography>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Yeni Lisans Oluştur</DialogTitle>
        <DialogContent>
          <Stack mt={1} spacing={2}>
            <TextField
              select
              label="Kurum"
              value={selectedInstitutionId}
              onChange={(e) => setSelectedInstitutionId(e.target.value)}
              fullWidth
            >
              <MenuItem value="" disabled>Kurum seçiniz</MenuItem>
              {(institutions ?? []).map((ins: Institution) => (
                <MenuItem key={ins.id} value={ins.id}>{ins.name}</MenuItem>
              ))}
            </TextField>
            <TextField label="License Key" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} fullWidth />
            <TextField type="number" label="Kullanıcı Limiti" value={userLimit} onChange={(e) => setUserLimit(e.target.value === "" ? "" : Number(e.target.value))} />
            <TextField type="date" label="Başlangıç" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <TextField type="date" label="Bitiş" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <TextField select label="Lisans Tipi" value={licenseType} onChange={(e) => setLicenseType(e.target.value)}>
              <MenuItem value="" disabled>Seçiniz</MenuItem>
              <MenuItem value="standard">Standart</MenuItem>
              <MenuItem value="demo">Demo</MenuItem>
              <MenuItem value="premium">Premium</MenuItem>
            </TextField>
            {errorMsg && (<Typography color="error" variant="body2">{errorMsg}</Typography>)}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>İptal</Button>
          <Button onClick={onSubmit} variant="contained" disabled={!licenseKey || !startDate || !endDate}>Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
