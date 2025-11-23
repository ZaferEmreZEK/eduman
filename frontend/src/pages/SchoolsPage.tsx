import { useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { School } from "../api/schools";
import { createSchool, deleteSchool, getSchoolsByInstitution, updateSchool } from "../api/schools";
import { getInstitutions, type Institution } from "../api/institutions";

export default function SchoolsPage() {
  const { id } = useParams();
  const institutionId = useMemo(() => (id ?? ""), [id]);
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const carriedName = (location.state as { institutionName?: string } | undefined)?.institutionName ?? "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["schools", institutionId],
    queryFn: () => getSchoolsByInstitution(institutionId),
    enabled: Boolean(institutionId),
  });

  const { data: institutions } = useQuery({
    queryKey: ["institutions"],
    queryFn: getInstitutions,
    enabled: !carriedName,
  });

  const institutionName =
    carriedName || (institutions ?? []).find((inst: Institution) => inst.id === institutionId)?.name || "Seçilen Kurum";

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [branchCount, setBranchCount] = useState<number | "">("");

  const openCreate = () => {
    setEditing(null);
    setName("");
    setAddress("");
    setBranchCount("");
    setOpen(true);
  };
  const openEdit = (row: School) => {
    setEditing(row);
    setName(row.name ?? "");
    setAddress((row as any).address ?? "");
    setBranchCount((row as any).branchCount ?? "");
    setOpen(true);
  };
  const close = () => setOpen(false);

  const createMut = useMutation({ mutationFn: createSchool, onSuccess: () => qc.invalidateQueries({ queryKey: ["schools", institutionId] }) });
  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<School> }) => updateSchool(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schools", institutionId] }),
  });
  const deleteMut = useMutation({ mutationFn: (id: string) => deleteSchool(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["schools", institutionId] }) });

  const onSubmit = async () => {
    const payload: Partial<School> = { name, institutionId, address: address || undefined, branchCount: branchCount === "" ? undefined : Number(branchCount) };
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, payload });
    } else {
      await createMut.mutateAsync(payload);
    }
    close();
  };

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5">Okullar ({institutionName})</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate("/institutions")}>Kurumlara Dön</Button>
            <Button variant="contained" onClick={openCreate}>Yeni Okul</Button>
          </Stack>
        </Stack>
        {isLoading && <Typography>Yükleniyor...</Typography>}
        {isError && <Typography>Veri alınamadı.</Typography>}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ad</TableCell>
              <TableCell>Adres</TableCell>
              <TableCell>Şube Sayısı</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.name}</TableCell>
                <TableCell>{(row as any).address ?? "-"}</TableCell>
                <TableCell>{(row as any).branchCount ?? 0}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      onClick={() => navigate(`/schools/${row.id}/classes`, { state: { schoolName: row.name ?? "" } })}
                    >
                      Sınıflar
                    </Button>
                    <Button size="small" onClick={() => openEdit(row)}>Düzenle</Button>
                    <Button size="small" color="error" onClick={() => deleteMut.mutate(row.id)}>Sil</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Okul Düzenle" : "Yeni Okul Ekle"}</DialogTitle>
        <DialogContent>
          <Stack mt={1} spacing={2}>
            <TextField label="Okul Adı" placeholder="Örn: Karşıyaka Kampüsü" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField label="Adres" placeholder="Okul adresi" value={address} onChange={(e) => setAddress(e.target.value)} fullWidth />
            <TextField type="number" label="Şube Sayısı" value={branchCount} onChange={(e) => setBranchCount(e.target.value === "" ? "" : Number(e.target.value))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>İptal</Button>
          <Button onClick={onSubmit} variant="contained" disabled={!name.trim()}>Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
