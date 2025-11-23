import { useState } from "react";
import { Container, Paper, Stack, Typography, TextField, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInstitutions, type Institution } from "../api/institutions";
import { getRoles, type Role } from "../api/roles";
import { createUser, deleteUser, getUsers, type User, updateUser } from "../api/users";
import StatusChip from "../components/StatusChip";

export default function UsersPage() {
  const qc = useQueryClient();
  const { data: institutions } = useQuery({ queryKey: ["institutions"], queryFn: getInstitutions });
  const { data: roles } = useQuery({ queryKey: ["roles"], queryFn: getRoles });

  // filters
  const [fInst, setFInst] = useState<string>("");
  const [fRole, setFRole] = useState<string>("");
  const [fStatus, setFStatus] = useState<"active" | "passive" | "">("");
  const [q, setQ] = useState("");

  const { data: users } = useQuery({
    queryKey: ["users", { fInst, fRole, fStatus, q }],
    queryFn: () => getUsers({ institutionId: fInst || undefined, role: fRole || undefined, status: (fStatus || undefined) as any, q: q || undefined }),
  });

  // modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [instId, setInstId] = useState("");
  const [status, setStatus] = useState<"active" | "passive">("active");
  const [password, setPassword] = useState("");

  const openCreate = () => { setEditing(null); setFullName(""); setEmail(""); setRoleId(""); setInstId(""); setStatus("active"); setOpen(true); };
  const openEdit = (u: User) => { setEditing(u); setFullName(u.fullName); setEmail(u.email); setRoleId(u.role); setInstId(u.institutionId); setStatus(u.status ?? "active"); setOpen(true); };
  const close = () => setOpen(false);

  const createMut = useMutation({ mutationFn: ({ payload, password }: { payload: Partial<User>; password?: string }) => createUser(payload, password), onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }) });
  const updateMut = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) => updateUser(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }) });
  const deleteMut = useMutation({ mutationFn: (id: string) => deleteUser(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }) });

  const onSubmit = async () => {
    const payload: Partial<User> = { fullName, email, role: roleId, institutionId: instId, status };
    if (editing) await updateMut.mutateAsync({ id: editing.id, payload }); else await createMut.mutateAsync({ payload, password });
    close();
  };

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5">Kullanıcı Yönetimi</Typography>
          <Button variant="contained" onClick={openCreate}>Yeni Kullanıcı Oluştur</Button>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
          <TextField select label="Kurum" value={fInst} onChange={(e) => setFInst(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">Tümü</MenuItem>
            {(institutions ?? []).map((ins: Institution) => (<MenuItem key={ins.id} value={ins.id}>{ins.name}</MenuItem>))}
          </TextField>
          <TextField select label="Rol" value={fRole} onChange={(e) => setFRole(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">Tümü</MenuItem>
            {(roles ?? []).map((r: Role) => (<MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>))}
          </TextField>
          <TextField select label="Durum" value={fStatus} onChange={(e) => setFStatus(e.target.value as any)} sx={{ minWidth: 200 }}>
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="active">Aktif</MenuItem>
            <MenuItem value="passive">Pasif</MenuItem>
          </TextField>
          <TextField label="Ara" value={q} onChange={(e) => setQ(e.target.value)} sx={{ minWidth: 240 }} />
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ad Soyad</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Okul/Kurum</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(users ?? []).map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.fullName}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{(roles ?? []).find(r => r.id === u.role)?.name ?? u.role}</TableCell>
                <TableCell>{(institutions ?? []).find(i => i.id === u.institutionId)?.name ?? u.institutionId}</TableCell>
                <TableCell>{u.status === "active" ? <StatusChip status="active" /> : <StatusChip status="passive" />}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" onClick={() => openEdit(u)}>Düzenle</Button>
                    <Button size="small" color="error" onClick={() => deleteMut.mutate(u.id)}>Sil</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı Oluştur"}</DialogTitle>
        <DialogContent>
          <Stack mt={1} spacing={2}>
            <TextField label="Ad Soyad" placeholder="Örn: Ahmet Yılmaz" value={fullName} onChange={(e) => setFullName(e.target.value)} fullWidth />
            <TextField label="Email" placeholder="ornek@eduman.com" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
            {!editing && (
              <TextField label="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
            )}
            <TextField select label="Rol" value={roleId} onChange={(e) => setRoleId(e.target.value)} fullWidth>
              <MenuItem value="" disabled>Seçiniz</MenuItem>
              {(roles ?? []).map((r: Role) => (<MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>))}
            </TextField>
            <TextField select label="Kurum" value={instId} onChange={(e) => setInstId(e.target.value)} fullWidth>
              <MenuItem value="" disabled>Seçiniz</MenuItem>
              {(institutions ?? []).map((ins: Institution) => (<MenuItem key={ins.id} value={ins.id}>{ins.name}</MenuItem>))}
            </TextField>
            <TextField select label="Durum" value={status} onChange={(e) => setStatus(e.target.value as any)} fullWidth>
              <MenuItem value="active">Aktif</MenuItem>
              <MenuItem value="passive">Pasif</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>İptal</Button>
          <Button onClick={onSubmit} variant="contained" disabled={!fullName.trim() || !email.trim() || !roleId || !instId || (!editing && !password)}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
