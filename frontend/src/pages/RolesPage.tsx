import { useEffect, useState } from "react";
import { Grid, Paper, Typography, List, ListItemButton, ListItemText, Stack, Button, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createRole, deleteRole, getRolePermissions, getRoles, type Role, updateRole, updateRolePermissions } from "../api/roles";

const defaultPermissions = [
  "Not Düzenleme",
  "Kullanıcı Yönetimi",
  "Ödev Oluşturma",
  "Rapor Görüntüleme",
  "Kurum Yönetimi",
  "Lisans Yönetimi",
  "Ayar Düzenleme",
  "Kullanıcı Silme",
];

export default function RolesPage() {
  const qc = useQueryClient();
  const { data: roles } = useQuery({ queryKey: ["roles"], queryFn: getRoles });
  const [selected, setSelected] = useState<Role | null>(null);
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const selectedId = selected?.id;

  // CRUD dialogs
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const openCreate = () => { setOpen(true); setName(""); setDesc(""); };
  const close = () => setOpen(false);

  const createMut = useMutation({ mutationFn: createRole, onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }) });
  const updateMut = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Partial<Role> }) => updateRole(id, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }) });
  const deleteMut = useMutation({ mutationFn: (id: string) => deleteRole(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }) });
  const savePermsMut = useMutation({ mutationFn: ({ id, list }: { id: string; list: string[] }) => updateRolePermissions(id, list) });

  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      try {
        const list = await getRolePermissions(selectedId);
        const base = (list && list.length ? list : defaultPermissions).reduce((acc: Record<string, boolean>, k) => {
          acc[k] = true;
          return acc;
        }, {});
        // ensure all defaults exist
        for (const p of defaultPermissions) if (!(p in base)) base[p] = false;
        setPerms(base);
      } catch {
        const base = defaultPermissions.reduce((acc: Record<string, boolean>, k) => { acc[k] = Math.random() > 0.3; return acc; }, {});
        setPerms(base);
      }
    })();
  }, [selectedId]);

  const toggle = (k: string) => setPerms((p) => ({ ...p, [k]: !p[k] }));
  const savePerms = async () => { if (selected) await savePermsMut.mutateAsync({ id: selected.id, list: Object.keys(perms).filter((k) => perms[k]) }); };

  const onCreate = async () => { await createMut.mutateAsync({ name, description: desc }); close(); };
  const onRename = async () => { if (selected) await updateMut.mutateAsync({ id: selected.id, payload: { name } }); };
  const onDelete = async () => { if (selected) await deleteMut.mutateAsync(selected.id); setSelected(null); };

  return (
    <Box sx={{ width: "100%", px: 3, py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Rol ve Yetki Yönetimi</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1">Roller</Typography>
              <Button size="small" variant="contained" onClick={openCreate}>Yeni Rol</Button>
            </Stack>
            <List>
              {(roles ?? []).map((r) => (
                <ListItemButton key={r.id} selected={r.id === selected?.id} onClick={() => setSelected(r)} sx={{ borderRadius: 1, mb: 0.5 }}>
                  <ListItemText primary={r.name} secondary={r.description} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1">{selected?.name ?? "Rol Seçiniz"} — Yetkiler</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" disabled={!selected} onClick={onRename}>Yeniden Adlandır</Button>
                <Button size="small" color="error" variant="outlined" disabled={!selected} onClick={onDelete}>Sil</Button>
                <Button size="small" variant="contained" disabled={!selected} onClick={savePerms}>Kaydet</Button>
              </Stack>
            </Stack>
            <Grid container spacing={1}>
              {Object.keys(perms).map((k) => (
                <Grid key={k} size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel control={<Switch checked={!!perms[k]} onChange={() => toggle(k)} />} label={k} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Yeni Rol</DialogTitle>
        <DialogContent>
          <Stack mt={1} spacing={2}>
            <TextField label="Ad" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField label="Açıklama" value={desc} onChange={(e) => setDesc(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>İptal</Button>
          <Button onClick={onCreate} variant="contained" disabled={!name.trim()}>Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}



