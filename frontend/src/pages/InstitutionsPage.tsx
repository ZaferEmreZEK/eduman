import { useState } from "react";
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
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createInstitution, deleteInstitution, getInstitutions, updateInstitution } from "../api/institutions";
import type { Institution, InstitutionPayload } from "../api/institutions";

export default function InstitutionsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["institutions"], queryFn: getInstitutions });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Institution | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [typeValue, setTypeValue] = useState<"public" | "private" | "">("");
  const [tenantId, setTenantId] = useState("");

  const openCreate = () => {
    setEditing(null);
    setName("");
    setAddress("");
    setTypeValue("");
    setTenantId("");
    setOpen(true);
  };
  const openEdit = (row: Institution) => {
    setEditing(row);
    setName(row.name ?? "");
    setAddress(row.address ?? "");
    setTypeValue(row.type ?? "");
    setTenantId(row.tenantId ?? "");
    setOpen(true);
  };
  const close = () => setOpen(false);

  const createMut = useMutation({ mutationFn: createInstitution, onSuccess: () => qc.invalidateQueries({ queryKey: ["institutions"] }) });
  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: InstitutionPayload }) => updateInstitution(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["institutions"] }),
  });
  const deleteMut = useMutation({ mutationFn: (id: string) => deleteInstitution(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["institutions"] }) });

  const onSubmit = async () => {
    const normalizedTenantId = tenantId.trim();
    const payload: InstitutionPayload = {
      tenantId: normalizedTenantId,
      name: name.trim() || undefined,
      address: address.trim() || undefined,
      type: typeValue || undefined,
    };
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, payload });
    } else {
      await createMut.mutateAsync(payload);
    }
    close();
  };
  const isSaveDisabled = !name.trim() || !tenantId.trim();

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5">Kurumlar</Typography>
          <Button variant="contained" onClick={openCreate}>Yeni Kurum</Button>
        </Stack>
        {isLoading && <Typography>Yükleniyor...</Typography>}
        {isError && <Typography>Veri alınamadı.</Typography>}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ad</TableCell>
              <TableCell>Adres</TableCell>
              <TableCell>Tip</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.name ?? "-"}</TableCell>
                <TableCell>{row.address ?? "-"}</TableCell>
                <TableCell>{row.type === "public" ? "Devlet" : row.type === "private" ? "Özel" : "-"}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      onClick={() => navigate(`/institutions/${row.id}/schools`, { state: { institutionName: row.name ?? "" } })}
                    >
                      Okullar
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
        <DialogTitle>{editing ? "Kurum Düzenle" : "Yeni Kurum Ekle"}</DialogTitle>
        <DialogContent>
          <Stack mt={1} spacing={2}>
            <TextField label="Kurum Adı" placeholder="Örn: Ankara Özel Koleji" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField label="Adres" placeholder="Kurum adresi" value={address} onChange={(e) => setAddress(e.target.value)} fullWidth />
            <TextField
              label="Tenant ID"
              placeholder="00000000-0000-0000-0000-000000000000"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              fullWidth
              required
              helperText="Backend'in zorunlu tuttuğu tenant kimliği (UUID)."
            />
            <TextField select label="Kurum Tipi" value={typeValue} onChange={(e) => setTypeValue(e.target.value as any)} fullWidth>
              <MenuItem value="" disabled>Seçiniz</MenuItem>
              <MenuItem value="public">Devlet</MenuItem>
              <MenuItem value="private">Özel</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>İptal</Button>
          <Button onClick={onSubmit} variant="contained" disabled={isSaveDisabled}>Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
