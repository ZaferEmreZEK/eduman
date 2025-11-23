import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosClient from "../api/axiosClient";
import { Button, TextField, Container, Typography, Paper, Box, Checkbox, FormControlLabel, Link as MuiLink } from "@mui/material";
import logo from "../assets/edumanLogo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axiosClient.post("/Auth/login", { email, password });
      const token = (res as any).data?.access_token ?? (res as any).data?.token ?? (res as any).data?.data?.access_token;
      localStorage.setItem("token", token);
      setMessage("Giriş başarılı!");
      navigate("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setMessage("Giriş başarısız: " + (err.response?.data?.title ?? err.message));
      } else {
        setMessage("Beklenmedik hata: " + String(err));
      }
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #F8FAFF 0%, #EEF4FF 60%, #F8FAFF 100%)",
      p: 2,
    }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box component="img" src={logo} alt="EDUMAN" sx={{ height: 56, mb: 1 }} />
          <Typography variant="h5" color="primary" fontWeight={800} letterSpacing={1}>EDUMAN</Typography>
          <Typography variant="body2" color="text.secondary">Eğitim Yönetim Sistemi</Typography>
        </Box>

        <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>Giriş Yap</Typography>
          <TextField fullWidth label="Email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField fullWidth label="Şifre" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
            <FormControlLabel control={<Checkbox />} label="Beni Hatırla" />
            <MuiLink href="#" onClick={(e) => e.preventDefault()} underline="hover" sx={{ cursor: "pointer" }}>
              Şifremi unuttum?
            </MuiLink>
          </Box>
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleLogin}>Giriş Yap</Button>
          {message && (
            <Typography sx={{ mt: 2 }} textAlign="center">{message}</Typography>
          )}
        </Paper>

        <Box sx={{ textAlign: "center", color: "text.secondary", mt: 3 }}>
          © 2025 EDUNEX Eğitim Teknolojileri A.Ş.
        </Box>
      </Container>
    </Box>
  );
}
