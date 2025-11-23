import { createTheme } from "@mui/material/styles";

// Marka benzeri açık tema tokenları
const palette = {
  mode: "light" as const,
  primary: { main: "#2F73FF", dark: "#0F3D89", light: "#7BA6FF" },
  secondary: { main: "#0A2E5C" },
  success: { main: "#2ecc71" },
  warning: { main: "#FF9F0A" },
  error: { main: "#e74c3c" },
  text: { primary: "#0F172A", secondary: "#475569" },
  grey: {
    50: "#F8FAFF",
    100: "#F5F7FB",
    200: "#EEF2F8",
    300: "#E6EAF2",
    500: "#94A3B8",
  },
  background: { default: "#F5F7FB", paper: "#FFFFFF" },
};

const theme = createTheme({
  palette,
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"].join(","),
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 10px 25px rgba(0,0,0,.08)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 10px 25px rgba(0,0,0,.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 16,
          paddingBlock: 10,
        },
        containedPrimary: {
          background: "linear-gradient(90deg, #2F73FF 0%, #0F3D89 100%)",
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: "#fff",
        },
        input: {
          paddingBlock: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: (palette as any).text.primary,
          boxShadow: "0 4px 12px rgba(0,0,0,.06)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottomColor: (palette as any).grey[300] },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999 },
      },
    },
  },
});

export default theme;
