import { useState } from "react";
import axios from "axios";
import axiosClient from "../api/axiosClient";
import { Button, TextField, Container, Typography, Paper } from "@mui/material";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      await axiosClient.post("/Auth/register", { email, password });
      setMessage("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setMessage("Kayıt başarısız: " + (err.response?.data?.title ?? err.message));
      } else {
        setMessage("Beklenmedik hata: " + String(err));
      }
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 5,
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Kayıt Ol
        </Typography>
        <TextField
          fullWidth
          label="Email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label="Şifre"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleRegister}>
          KAYIT OL
        </Button>
        {message && (
          <Typography sx={{ mt: 2 }} textAlign="center">
            {message}
          </Typography>
        )}
      </Paper>
    </Container>
  );
}
