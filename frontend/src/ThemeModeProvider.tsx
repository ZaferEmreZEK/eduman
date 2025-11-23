import React, { useCallback, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import { ThemeModeContext } from "./ThemeModeContext";

function createAppTheme(mode: PaletteMode) {
  const isDark = mode === "dark";
  const palette = {
    mode,
    primary: { main: "#2F73FF", dark: "#0F3D89", light: "#7BA6FF" },
    secondary: { main: "#0A2E5C" },
    success: { main: "#2ecc71" },
    warning: { main: "#FF9F0A" },
    error: { main: "#e74c3c" },
    text: isDark
      ? { primary: "#E5E7EB", secondary: "#9AA5B1" }
      : { primary: "#0F172A", secondary: "#475569" },
    grey: isDark
      ? { 50: "#1F2937", 100: "#111827", 200: "#0F172A", 300: "#1F2937", 500: "#64748B" }
      : { 50: "#F8FAFF", 100: "#F5F7FB", 200: "#EEF2F8", 300: "#E6EAF2", 500: "#94A3B8" },
    background: isDark
      ? { default: "#0B1220", paper: "#0F172A" }
      : { default: "#F5F7FB", paper: "#FFFFFF" },
  } as const;

  return createTheme({
    palette: palette as any,
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
            boxShadow: isDark ? "0 10px 25px rgba(0,0,0,.35)" : "0 10px 25px rgba(0,0,0,.08)",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark ? "0 10px 25px rgba(0,0,0,.35)" : "0 10px 25px rgba(0,0,0,.08)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10, paddingInline: 16, paddingBlock: 10 },
          containedPrimary: { background: "linear-gradient(90deg, #2F73FF 0%, #0F3D89 100%)" },
        },
        defaultProps: { disableElevation: true },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 10, background: isDark ? (palette as any).grey[200] : "#fff" },
          input: { paddingBlock: 12 },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? (palette as any).background.default : "#ffffff",
            color: (palette as any).text.primary,
            boxShadow: isDark ? "0 4px 16px rgba(0,0,0,.45)" : "0 4px 12px rgba(0,0,0,.06)",
          },
        },
      },
      MuiTableCell: { styleOverrides: { root: { borderBottomColor: (palette as any).grey[300] } } },
      MuiChip: { styleOverrides: { root: { borderRadius: 999 } } },
    },
  });
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(() => (localStorage.getItem("themeMode") as PaletteMode) || "light");
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const toggle = useCallback(() => setMode((m) => (m === "light" ? "dark" : "light")), []);

  // persist
  React.useEffect(() => {
    localStorage.setItem("themeMode", mode);
    // also set attribute for potential CSS hooks
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode, toggle }), [mode, setMode, toggle]);
  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}




