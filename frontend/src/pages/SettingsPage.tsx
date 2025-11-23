import { useContext, useEffect, useMemo, useState } from "react";
import { Container, Paper, Typography, Stack, TextField, Button, Switch, FormControlLabel, Avatar } from "@mui/material";
import { getCurrentUser, type UserDto } from "../api/users";
import { ThemeModeContext } from "../ThemeModeContext";
import { changePassword } from "../api/users";

export default function SettingsPage() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [next2, setNext2] = useState("");
  const { mode, setMode } = useContext(ThemeModeContext);
  const dark = mode === "dark";

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const me = await getCurrentUser();
        if (!isMounted) return;
        setUser(me);
        setName(me.fullName ?? "");
        setEmail(me.email ?? "");
      } catch (err) {
        console.error("Failed to load current user", err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const initials = useMemo(() => {
    const source = (name || user?.fullName || "").trim();
    if (!source) return "";
    const parts = source.split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
    return (first + last).toUpperCase();
  }, [name, user]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Ayarlar</Typography>

      <Stack spacing={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Profil Bilgileri</Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>{initials || ""}</Avatar>
            <Button variant="outlined">Fotoğraf Değiştir</Button>
          </Stack>
          <Stack spacing={2}>
            <TextField label="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth disabled />
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Şifre Değiştir</Typography>
          <Stack spacing={2}>
            <TextField label="Mevcut Şifre" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
            <TextField label="Yeni Şifre" type="password" value={next} onChange={(e) => setNext(e.target.value)} />
            <TextField label="Yeni Şifre Tekrar" type="password" value={next2} onChange={(e) => setNext2(e.target.value)} />
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Tema Ayarları</Typography>
          <FormControlLabel control={<Switch checked={dark} onChange={(e) => setMode(e.target.checked ? "dark" : "light")} />} label="Koyu Mod" />
        </Paper>

        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button variant="outlined" onClick={() => { setCurrent(""); setNext(""); setNext2(""); }}>İptal</Button>
          <Button variant="contained" onClick={async () => {
            if (next || next2 || current) {
              if (!current || !next || next !== next2) {
                alert("Lütfen geçerli bir şifre girin ve yeni şifreleri eşleştirin.");
                return;
              }
              try {
                await changePassword({ currentPassword: current, newPassword: next });
                alert("Şifre güncellendi.");
                setCurrent(""); setNext(""); setNext2("");
              } catch (e: any) {
                alert(e?.response?.data?.message ?? "Şifre güncellenemedi.");
              }
            }
          }}>Kaydet</Button>
        </Stack>
      </Stack>
    </Container>
  );
}
