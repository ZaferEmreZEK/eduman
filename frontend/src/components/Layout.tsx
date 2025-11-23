import { AppBar, Toolbar, Box, Drawer, List, ListItemButton, ListItemText, Typography, TextField, Stack, Button } from "@mui/material";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
import logo from "../assets/edumanLogo.png";

const drawerWidth = 248;

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const isAuth = location.pathname === "/" || location.pathname === "/register";
  const loggedIn = Boolean(localStorage.getItem("token"));

  if (isAuth) {
    return <Outlet />; // Login/Register sayfaları full-screen
  }

  const nav = [
    { label: "Ana Sayfa", to: "/dashboard" },
    { label: "Kurumlar", to: "/institutions" },
    { label: "Kullanıcılar", to: "/users" },
    { label: "Roller ve Yetkiler", to: "/roles" },
    { label: "Lisanslar", to: "/licenses" },
    { label: "Raporlar", to: "/reports" },
    { label: "Ayarlar", to: "/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 2 }}>
          <Box component={Link} to="/dashboard" sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Box component="img" src={logo} alt="EDUMAN" sx={{ height: 36, mr: 1 }} />
            <Typography variant="h6" color="text.primary">EDUMAN</Typography>
          </Box>

          <Box sx={{ flex: 1 }} />
          <TextField size="small" placeholder="Ara..." sx={{ minWidth: 280 }} />
          <Stack direction="row" spacing={1} alignItems="center">
            {loggedIn && (
              <Button variant="outlined" color="inherit" onClick={handleLogout}>Çıkış</Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            background: theme.palette.secondary.main,
            color: "#fff",
            borderRight: 0,
          },
        }}
      >
        <Toolbar />
        <List>
          {nav.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <ListItemButton
                key={item.to}
                component={Link}
                to={item.to}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  background: active ? "linear-gradient(90deg, rgba(255,255,255,.12), rgba(255,255,255,.06))" : "transparent",
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
