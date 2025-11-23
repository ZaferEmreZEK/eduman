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
import type { ClassItem } from "../api/classes";
import { createClass, deleteClass, getClassesBySchool } from "../api/classes";

export default function ClassesPage() {
  const { id } = useParams();
  const schoolId = useMemo(() => id ?? "", [id]);
  const navigate = useNavigate();
  const location = useLocation();
  const carriedName = (location.state as { schoolName?: string } | undefined)?.schoolName ?? "";
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["classes", schoolId],
    queryFn: () => getClassesBySchool(schoolId),
    enabled: Boolean(schoolId),
  });

  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState("");
  const [section, setSection] = useState("");

  const createMut = useMutation({
    mutationFn: createClass,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["classes", schoolId] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteClass(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["classes", schoolId] }),
  });

  const onSubmit = async () => {
    await createMut.mutateAsync({ level, section, schoolId });
    setOpen(false);
    setLevel("");
    setSection("");
  };

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5">Sınıflar ({carriedName || "Seçilen Okul"})</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate(-1)}>Geri</Button>
            <Button variant="contained" onClick={() => setOpen(true)}>Yeni Sınıf</Button>
          </Stack>
        </Stack>
        {isLoading && <Typography>Yükleniyor...</Typography>}
        {isError && <Typography>Veri alınamadı.</Typography>}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Seviye</TableCell>
              <TableCell>Şube</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data ?? []).map((row: ClassItem) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.level ?? "-"}</TableCell>
                <TableCell>{row.section ?? "-"}</TableCell>
                <TableCell align="right">
                  <Button size="small" color="error" onClick={() => deleteMut.mutate(row.id)}>Sil</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Yeni Sınıf</DialogTitle>
        <DialogContent>
          <Stack mt={1} spacing={2}>
            <TextField label="Seviye" value={level} onChange={(e) => setLevel(e.target.value)} fullWidth />
            <TextField label="Şube" value={section} onChange={(e) => setSection(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>İptal</Button>
          <Button onClick={onSubmit} variant="contained" disabled={!level.trim()}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
